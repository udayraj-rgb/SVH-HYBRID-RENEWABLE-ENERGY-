package com.tejasgrid.service;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.client.QueryApi;
import com.influxdb.query.FluxRecord;
import com.influxdb.query.FluxTable;
import com.tejasgrid.dto.TelemetrySnapshot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetryService {

    private final InfluxDBClient influxDBClient;

    @Value("${influxdb.bucket}")
    private String bucket;

    @Value("${influxdb.org}")
    private String influxOrg;

    public TelemetrySnapshot getLatestSnapshot() {
        String flux = String.format("""
            from(bucket: \"%s\")
              |> range(start: -5m)
              |> filter(fn: (r) => r._measurement == \"energy_metrics\")
              |> last()
              |> pivot(rowKey: [\"_time\"], columnKey: [\"_field\"], valueColumn: \"_value\")
            """, bucket);

        QueryApi queryApi = influxDBClient.getQueryApi();
        List<FluxTable> tables = queryApi.query(flux, influxOrg);

        if (tables.isEmpty() || tables.get(0).getRecords().isEmpty()) {
            log.warn("No telemetry data found in last 5 minutes, returning default snapshot");
            return TelemetrySnapshot.builder()
                    .timestamp(Instant.now())
                    .solarGenerationKw(0.0)
                    .windGenerationKw(0.0)
                    .campusLoadKw(300.0)
                    .batterySOCPercent(75.0)
                    .gridImportKw(300.0)
                    .demoState("normal")
                    .build();
        }

        FluxRecord record = tables.get(0).getRecords().get(0);

        return TelemetrySnapshot.builder()
                .timestamp((Instant) record.getTime())
                .solarGenerationKw(getDouble(record, "solar_generation_kw"))
                .windGenerationKw(getDouble(record, "wind_generation_kw"))
                .campusLoadKw(getDouble(record, "campus_load_kw"))
                .batterySOCPercent(getDouble(record, "battery_soc_percent"))
                .gridImportKw(getDouble(record, "grid_import_kw"))
                .demoState(getString(record, "demo_state"))
                .build();
    }

    private double getDouble(FluxRecord record, String field) {
        Object val = record.getValueByKey(field);
        if (val == null) return 0.0;
        if (val instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return 0.0; }
    }

    private String getString(FluxRecord record, String field) {
        Object val = record.getValueByKey(field);
        return val != null ? val.toString() : "unknown";
    }
}
