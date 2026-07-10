import test from 'node:test';
import assert from 'node:assert';
import { GenAIEngine } from '../ai-engine.js';
import { StadiumTelemetrySimulator } from '../mock-data.js';
import { INCIDENT_TEMPLATES, STADIUM_SECTORS, INITIAL_GATES, INITIAL_CONCESSIONS } from '../mock-data.js';

test('GenAIEngine Incident Analysis Tests', async (t) => {
    const engine = new GenAIEngine();

    // 1. Test Medical Alert Incident
    const medicalIncident = INCIDENT_TEMPLATES.find(i => i.type === 'Medical Alert');
    const medicalBlueprint = await engine.analyzeIncident(medicalIncident);

    assert.strictEqual(medicalBlueprint.id, medicalIncident.id);
    assert.strictEqual(medicalBlueprint.severity, 'High');
    assert.ok(medicalBlueprint.reasoningChain.length > 0);
    assert.ok(medicalBlueprint.immediateActions.some(action => action.includes('Medic')));
    assert.ok(medicalBlueprint.dispatchedUnits.includes('Medic Team Beta'));
    assert.ok(medicalBlueprint.broadcastTemplate.includes('Medical responders'));

    // 2. Test Crowd Bottleneck Incident
    const crowdIncident = INCIDENT_TEMPLATES.find(i => i.type === 'Crowd Bottleneck');
    const crowdBlueprint = await engine.analyzeIncident(crowdIncident);

    assert.strictEqual(crowdBlueprint.severity, 'Medium');
    assert.ok(crowdBlueprint.dispatchedUnits.includes('Crowd Patrol Unit 4'));
    assert.ok(crowdBlueprint.broadcastTemplate.includes('Egress Announcement'));

    // 3. Test Access Control Incident
    const accessIncident = INCIDENT_TEMPLATES.find(i => i.type === 'Access Control');
    const accessBlueprint = await engine.analyzeIncident(accessIncident);

    assert.strictEqual(accessBlueprint.severity, 'Medium');
    assert.ok(accessBlueprint.dispatchedUnits.includes('IT Infrastructure Tech Delta'));

    // 4. Test Safety Hazard Incident
    const safetyIncident = INCIDENT_TEMPLATES.find(i => i.type === 'Safety Hazard');
    const safetyBlueprint = await engine.analyzeIncident(safetyIncident);

    assert.strictEqual(safetyBlueprint.severity, 'Low');
    assert.ok(safetyBlueprint.immediateActions.some(action => action.includes('wet floor')));

    // 5. Test Multilingual Support Incident
    const langIncident = INCIDENT_TEMPLATES.find(i => i.type === 'Multilingual Support');
    const langBlueprint = await engine.analyzeIncident(langIncident);

    assert.strictEqual(langBlueprint.severity, 'Low');
    assert.ok(langBlueprint.dispatchedUnits.includes('Vol-4209 (Multilingual Steward - FR/EN)'));
});

test('GenAIEngine Fan Query Solver Tests', async (t) => {
    const engine = new GenAIEngine();

    // English detection and response
    const enQuery = "where is the gate?";
    const enResult = await engine.answerFanQuery(enQuery);
    assert.strictEqual(enResult.language, 'en');
    assert.strictEqual(enResult.topic, 'Gates & Navigation');
    assert.ok(enResult.text.includes('Gate C'));

    // Spanish detection and response
    const esQuery = "dónde está la puerta o comida?";
    const esResult = await engine.answerFanQuery(esQuery);
    assert.strictEqual(esResult.language, 'es');
    assert.strictEqual(esResult.topic, 'Gates & Navigation'); // matches gate first

    const esFoodQuery = "hola comida tacos";
    const esFoodResult = await engine.answerFanQuery(esFoodQuery);
    assert.strictEqual(esFoodResult.language, 'es');
    assert.strictEqual(esFoodResult.topic, 'Food & Merch Concessions');
    assert.ok(esFoodResult.text.includes('Copa Tacos'));

    // Arabic detection and response
    const arQuery = "مترو";
    const arResult = await engine.answerFanQuery(arQuery);
    assert.strictEqual(arResult.language, 'ar');
    assert.strictEqual(arResult.topic, 'Transit & Parking Routes');

    // Unknown query fallback
    const unknownQuery = "xyz123";
    const unknownResult = await engine.answerFanQuery(unknownQuery);
    assert.strictEqual(unknownResult.topic, 'General Inquiry');
    assert.ok(unknownResult.text.includes('xyz123'));
});

test('GenAIEngine Sustainability Report Tests', (t) => {
    const engine = new GenAIEngine();

    // Under 85% occupancy triggers HVAC energy savings
    const lowSectors = [
        { id: 'north', capacity: 10000, current: 5000 },
        { id: 'south', capacity: 10000, current: 3000 }
    ];
    const normalGates = [{ id: 'A', status: 'Normal' }];
    const optimalConcessions = [{ id: 'food1', status: 'Optimal' }];

    const report = engine.generateSustainabilityReport(lowSectors, normalGates, optimalConcessions);

    assert.strictEqual(report.occupancyPct, 40);
    assert.strictEqual(report.energySavingKw, 140);
    assert.strictEqual(report.trashCapacityStatus, 'Nominal');
    assert.ok(report.recommendations.some(r => r.title.includes('HVAC')));

    // High Density trash status if multiple concessions crowded
    const crowdedConcessions = [
        { id: 'food1', status: 'Crowded' },
        { id: 'food2', status: 'Crowded' }
    ];
    const reportHighWaste = engine.generateSustainabilityReport(lowSectors, normalGates, crowdedConcessions);
    assert.strictEqual(reportHighWaste.trashCapacityStatus, 'High Density');
    assert.ok(reportHighWaste.recommendations.some(r => r.title.includes('Waste Compactors')));
});

test('GenAIEngine Live Gemini API Mock Test', async (t) => {
    const engine = new GenAIEngine();
    engine.setApiKey('mock-api-key');

    const originalFetch = globalThis.fetch;
    // Mock fetch
    globalThis.fetch = async (url, options) => {
        assert.ok(url.includes('generateContent'));
        assert.strictEqual(options.headers['x-goog-api-key'], 'mock-api-key');
        return {
            ok: true,
            json: async () => ({
                candidates: [{
                    content: {
                        parts: [{
                            text: JSON.stringify({
                                language: 'en',
                                languageLabel: 'English detected',
                                topic: 'Gates & Navigation',
                                text: 'Mocked response from Gemini API.'
                            })
                        }]
                    }
                }]
            })
        };
    };

    try {
        const result = await engine.answerFanQuery('How to enter?');
        assert.strictEqual(result.language, 'en');
        assert.strictEqual(result.text, 'Mocked response from Gemini API.');
    } finally {
        globalThis.fetch = originalFetch; // restore original
    }
});

test('StadiumTelemetrySimulator Tests', (t) => {
    const simulator = new StadiumTelemetrySimulator();
    let called = false;
    let telemetryData = null;

    const unsubscribe = simulator.subscribe((data) => {
        called = true;
        telemetryData = data;
    });

    assert.ok(called);
    assert.ok(telemetryData);
    assert.ok(telemetryData.gates.length > 0);

    // Trigger telemetry update
    simulator.updateTelemetry();
    
    // Trigger new incident
    const newInc = simulator.triggerNewIncident();
    assert.ok(newInc);
    assert.ok(telemetryData.incidents.some(i => i.id === newInc.id));

    // Resolve incident
    simulator.resolveIncident(newInc.id);
    const resolvedInc = telemetryData.incidents.find(i => i.id === newInc.id);
    assert.strictEqual(resolvedInc.status, 'Resolved');

    unsubscribe();
});
