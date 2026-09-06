package com.tejas.orchestrator.entity;

public enum DispatchAction {
    CHARGE_SOLAR,             // Absorb surplus renewable energy before exporting
    DISCHARGE_PEAK_SHAVING,   // Discharge during 18:00 - 22:00 evening peak to prevent expensive grid draw
    LOAD_SHIFT_TRIGGER,       // Trigger deferred high-elasticity loads (water pumps, workshop machinery) during solar surplus
    GRID_SUPPORT_IDLE         // Maintain minimum safety reserve for critical emergency loads
}
