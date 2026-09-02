import os
import math
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Tuple

import requests
import numpy as np
from sklearn.ensemble import RandomForestRegressor

logger = logging.getLogger("tejas.ml_engine")

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
CAMPUS_LAT = float(os.getenv("CAMPUS_LATITUDE", "19.0760"))
CAMPUS_LON = float(os.getenv("CAMPUS_LONGITUDE", "72.8777"))


class WeatherPredictor:
    """
    Fetches real-time 24-hour weather forecasts from OpenWeatherMap API
    or generates realistic synthetic diurnal weather if key is missing or network fails.
    """

    def __init__(self, api_key: str = OPENWEATHER_API_KEY, lat: float = CAMPUS_LAT, lon: float = CAMPUS_LON):
        self.api_key = api_key
        self.lat = lat
        self.lon = lon

    def get_24h_weather_forecast(self) -> List[Dict[str, Any]]:
        """
        Return 24 hourly weather forecast records:
        [{ 'timestamp': str, 'hour': int, 'temperature_c': float, 'cloud_cover_percent': float, 'solar_irradiance_index': float }]
        """
        if self.api_key and self.api_key.strip() and not self.api_key.startswith("your_"):
            try:
                forecast = self._fetch_openweather_forecast()
                if forecast and len(forecast) == 24:
                    logger.info("Successfully fetched 24h weather forecast from OpenWeatherMap API.")
                    return forecast
            except Exception as exc:
                logger.warning("OpenWeatherMap API request failed, falling back to synthetic generator: %s", exc)

        logger.info("Generating synthetic 24h diurnal weather forecast.")
        return self._generate_synthetic_weather_24h()

    def _fetch_openweather_forecast(self) -> List[Dict[str, Any]]:
        """Query OpenWeather 5-day / 3-hour forecast and interpolate to 24 hourly points."""
        url = "https://api.openweathermap.org/data/2.5/forecast"
        params = {
            "lat": self.lat,
            "lon": self.lon,
            "appid": self.api_key,
            "units": "metric",
        }
        response = requests.get(url, params=params, timeout=5)
        response.raise_for_status()
        data = response.json()

        # OpenWeather returns points every 3 hours; extract next 8 points (24 hours) and interpolate
        three_hour_points = data.get("list", [])[:8]
        if not three_hour_points:
            raise ValueError("Empty list received from OpenWeather API.")

        hourly_results: List[Dict[str, Any]] = []
        base_time = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)

        # Extract 3-hour points (temp, clouds)
        t_temps = [p["main"]["temp"] for p in three_hour_points]
        t_clouds = [p["clouds"]["all"] for p in three_hour_points]

        # Expand / interpolate to 24 hours
        xp = [i * 3 for i in range(len(three_hour_points))]
        x_new = list(range(24))
        interp_temps = np.interp(x_new, xp, t_temps)
        interp_clouds = np.interp(x_new, xp, t_clouds)

        for i in range(24):
            hour_dt = base_time + timedelta(hours=i)
            hour_val = hour_dt.hour
            temp = float(round(interp_temps[i], 1))
            clouds = float(round(interp_clouds[i], 1))
            irradiance = self._calculate_solar_irradiance(hour_val, clouds)

            hourly_results.append({
                "timestamp": hour_dt.isoformat(),
                "hour": hour_val,
                "temperature_c": temp,
                "cloud_cover_percent": clouds,
                "solar_irradiance_index": irradiance,
                "source": "openweather",
            })

        return hourly_results

    def _generate_synthetic_weather_24h(self) -> List[Dict[str, Any]]:
        """
        Generates realistic 24-hour diurnal weather pattern:
        - Temperature: Diurnal sinusoid (22°C minimum at 05:00, 33°C peak at 14:00).
        - Cloud cover: Naturally drifting between 10% and 35%.
        - Solar irradiance: 0.0 at night (20:00 to 05:00), bell curve peaking at 12:00.
        """
        hourly_results: List[Dict[str, Any]] = []
        base_time = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)

        for i in range(24):
            target_dt = base_time + timedelta(hours=i)
            hour = target_dt.hour

            # Diurnal temperature cycle: min at 5 AM, max at 14:00
            temp_offset = math.sin((hour - 5) / 24.0 * 2 * math.pi - (math.pi / 2))
            temperature = 27.5 + 5.5 * temp_offset + round(math.sin(i * 0.7) * 0.5, 1)

            # Cloud cover with gentle variation
            cloud_cover = round(20.0 + 10.0 * math.sin(hour / 4.0) + math.cos(i * 0.5) * 3.0, 1)
            cloud_cover = max(5.0, min(80.0, cloud_cover))

            irradiance = self._calculate_solar_irradiance(hour, cloud_cover)

            hourly_results.append({
                "timestamp": target_dt.isoformat(),
                "hour": hour,
                "temperature_c": round(temperature, 1),
                "cloud_cover_percent": cloud_cover,
                "solar_irradiance_index": irradiance,
                "source": "synthetic_fallback",
            })

        return hourly_results

    @staticmethod
    def _calculate_solar_irradiance(hour: int, cloud_cover: float) -> float:
        """
        Calculate solar irradiance index [0.0, 1.0].
        Strictly 0.0 at night (hour < 6 or hour >= 19).
        Midday peak around hour 12, attenuated by cloud cover.
        """
        if hour < 6 or hour >= 19:
            return 0.0

        # Daylight sine curve peaking at 12:00
        norm_hour = (hour - 6.0) / 13.0
        clearsky_index = math.sin(math.pi * norm_hour)

        # Attenuate by cloud cover (clouds block up to 75% of irradiance)
        cloud_factor = 1.0 - (cloud_cover / 100.0) * 0.75
        irradiance = clearsky_index * cloud_factor
        return round(max(0.0, min(1.0, irradiance)), 4)


class YieldForecastModel:
    """
    Predictive AI/ML Engine for 24-hour campus power yields and load profiles.
    Uses Scikit-Learn trained on photovoltaic irradiance conversion curves.
    """

    def __init__(self, weather_predictor: WeatherPredictor = None):
        self.weather_predictor = weather_predictor or WeatherPredictor()
        self.model = RandomForestRegressor(n_estimators=60, random_state=42)
        self._train_model()

    def _train_model(self) -> None:
        """
        Train Scikit-Learn model on solar irradiance-to-kW conversion physics:
        Peak capacity: 1200 kW (matching TEJAS GRID maximum solar array capacity).
        Features: [solar_irradiance_index, cloud_cover_percent, temperature_c, hour]
        Target: solar_generation_kw
        """
        np.random.seed(42)
        samples = 1500
        
        # Synthetic training dataset across various weather scenarios
        hours = np.random.randint(0, 24, size=samples)
        cloud_covers = np.random.uniform(0.0, 95.0, size=samples)
        temperatures = np.random.uniform(15.0, 42.0, size=samples)

        irradiances = []
        solar_outputs = []

        for h, c, t in zip(hours, cloud_covers, temperatures):
            if h < 6 or h >= 19:
                irr = 0.0
                kw = 0.0
            else:
                norm_h = (h - 6.0) / 13.0
                clearsky = math.sin(math.pi * norm_h)
                irr = clearsky * (1.0 - (c / 100.0) * 0.75)
                # Standard PV conversion with temperature coefficient derate (-0.4%/°C above 25°C)
                temp_factor = 1.0 - 0.004 * max(0.0, t - 25.0)
                kw = 1200.0 * irr * temp_factor + np.random.normal(0, 5.0)
                kw = max(0.0, min(1200.0, kw))

            irradiances.append(irr)
            solar_outputs.append(kw)

        X = np.column_stack([irradiances, cloud_covers, temperatures, hours])
        y = np.array(solar_outputs)

        self.model.fit(X, y)
        logger.info("YieldForecastModel successfully trained on photovoltaic conversion curves.")

    def predict_24h_forecast(self) -> Dict[str, Any]:
        """
        Generate 24 hourly projections for solar, wind, campus load, and net balance.
        """
        weather_list = self.weather_predictor.get_24h_weather_forecast()
        hourly_forecast: List[Dict[str, Any]] = []

        total_solar_kwh = 0.0
        total_wind_kwh = 0.0
        total_load_kwh = 0.0

        for item in weather_list:
            hour = item["hour"]
            irr = item["solar_irradiance_index"]
            clouds = item["cloud_cover_percent"]
            temp = item["temperature_c"]
            ts = item["timestamp"]

            # Strict constraint: Nighttime hours (8:00 PM / 20:00 to 5:00 AM / 05:00, or hour < 6 or hour >= 19)
            # must strictly output predicted_solar_kw = 0.0
            if hour < 6 or hour >= 19:
                solar_kw = 0.0
            else:
                input_feat = np.array([[irr, clouds, temp, hour]])
                pred = float(self.model.predict(input_feat)[0])
                solar_kw = round(max(0.0, min(1200.0, pred)), 2)

            # Wind generation model (bounded random walk / diurnal curve between 20 kW and 140 kW)
            # Typical campus wind tends to pick up in afternoon and evening
            wind_base = 65.0 + 35.0 * math.sin((hour - 14) / 24.0 * 2 * math.pi)
            wind_jitter = math.cos(hour * 1.3) * 12.0
            wind_kw = round(max(20.0, min(140.0, wind_base + wind_jitter)), 2)

            # Campus load profile (Base 450 kW, peaks up to 850 kW during academic day)
            if 8 <= hour <= 18:
                # Academic / commercial working hours
                load_curve = math.sin((hour - 8.0) / 10.0 * math.pi)
                campus_load_kw = round(520.0 + 290.0 * load_curve + math.sin(hour) * 20.0, 2)
            elif 19 <= hour <= 23:
                # Evening dorm & library load
                campus_load_kw = round(560.0 + math.sin(hour * 0.8) * 40.0, 2)
            else:
                # Late night / early morning base load
                campus_load_kw = round(450.0 + math.cos(hour) * 25.0, 2)

            campus_load_kw = max(450.0, min(850.0, campus_load_kw))

            # Net Balance = (Solar + Wind) - Campus Load
            total_generation = solar_kw + wind_kw
            net_balance = round(total_generation - campus_load_kw, 2)

            # Deficit Risk: True if net_balance_kw < -200 kW
            deficit_risk = bool(net_balance < -200.0)

            total_solar_kwh += solar_kw
            total_wind_kwh += wind_kw
            total_load_kwh += campus_load_kw

            hourly_forecast.append({
                "timestamp": ts,
                "hour": hour,
                "predicted_solar_kw": solar_kw,
                "predicted_wind_kw": wind_kw,
                "total_generation_kw": round(total_generation, 2),
                "predicted_campus_load_kw": campus_load_kw,
                "net_balance_kw": net_balance,
                "deficit_risk": deficit_risk,
                "temperature_c": temp,
                "cloud_cover_percent": clouds,
                "solar_irradiance_index": irr,
            })

        # Calculate Summary Metrics
        # Find hour with deepest deficit (most negative net_balance_kw)
        deepest_deficit_entry = min(hourly_forecast, key=lambda x: x["net_balance_kw"])
        peak_deficit_hour = deepest_deficit_entry["timestamp"]
        max_deficit_kw = round(abs(min(0.0, deepest_deficit_entry["net_balance_kw"])), 2)
        hours_at_risk = sum(1 for x in hourly_forecast if x["deficit_risk"])

        return {
            "hourly_forecast": hourly_forecast,
            "summary": {
                "peak_deficit_hour": peak_deficit_hour,
                "max_deficit_kw": max_deficit_kw,
                "total_projected_solar_kwh": round(total_solar_kwh, 2),
                "total_projected_wind_kwh": round(total_wind_kwh, 2),
                "total_projected_load_kwh": round(total_load_kwh, 2),
                "hours_at_deficit_risk": hours_at_risk,
                "weather_source": weather_list[0].get("source", "synthetic_fallback"),
            },
        }
