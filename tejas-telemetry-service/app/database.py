import os
import logging
from typing import Optional
from influxdb_client import InfluxDBClient
from influxdb_client.client.write_api import SYNCHRONOUS

logger = logging.getLogger("tejas.database")

# InfluxDB Configuration
INFLUXDB_URL = os.getenv("INFLUXDB_URL", "http://localhost:8086")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN", "tejas_super_secret_influx_token_2026")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG", "tejas_grid_org")
INFLUXDB_BUCKET = os.getenv("INFLUXDB_BUCKET", "campus_telemetry")

# Global client singleton
_client: Optional[InfluxDBClient] = None


def get_influx_client() -> InfluxDBClient:
    """Return or initialize the singleton InfluxDBClient."""
    global _client
    if _client is None:
        _client = InfluxDBClient(
            url=INFLUXDB_URL,
            token=INFLUXDB_TOKEN,
            org=INFLUXDB_ORG,
            timeout=10_000,
        )
    return _client


def get_write_api():
    """Return synchronous write API for point ingestion."""
    client = get_influx_client()
    return client.write_api(write_options=SYNCHRONOUS)


def get_query_api():
    """Return Flux query API."""
    client = get_influx_client()
    return client.query_api()


def check_influx_health() -> bool:
    """Check if InfluxDB instance is reachable and ready."""
    try:
        client = get_influx_client()
        health = client.health()
        return health.status == "pass"
    except Exception as exc:
        logger.warning("InfluxDB health check failed: %s", exc)
        return False


def close_influx_client() -> None:
    """Close the InfluxDB client connection."""
    global _client
    if _client is not None:
        try:
            _client.close()
            logger.info("InfluxDB connection closed.")
        except Exception as exc:
            logger.error("Error closing InfluxDB connection: %s", exc)
        finally:
            _client = None
