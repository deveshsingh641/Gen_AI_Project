// mock-data.js
// Mock data and real-time telemetry simulator for FIFA World Cup 2026

export const STADIUM_SECTORS = [
    { id: 'north', name: 'North Stand', capacity: 18000, current: 15420, temp: 22, safetyRating: 'Optimal' },
    { id: 'east', name: 'East Stand (Premium)', capacity: 22000, current: 20110, temp: 21, safetyRating: 'Optimal' },
    { id: 'south', name: 'South Stand', capacity: 18000, current: 17850, temp: 23, safetyRating: 'Dense' },
    { id: 'west', name: 'West Stand (Family)', capacity: 12000, current: 9540, temp: 22, safetyRating: 'Optimal' }
];

export const INITIAL_GATES = [
    { id: 'A', name: 'Gate A (North Transit)', queueTime: 12, throughput: 140, status: 'Normal', securityOpen: 8 },
    { id: 'B', name: 'Gate B (VIP & Accessible)', queueTime: 5, throughput: 45, status: 'Optimal', securityOpen: 4 },
    { id: 'C', name: 'Gate C (East Parking)', queueTime: 32, throughput: 195, status: 'Crowded', securityOpen: 10 },
    { id: 'D', name: 'Gate D (West Metro Hub)', queueTime: 18, throughput: 160, status: 'Normal', securityOpen: 6 }
];

export const INITIAL_CONCESSIONS = [
    { id: 'food1', name: 'Copa Tacos (Sec 104)', type: 'Food', queueTime: 8, popularItem: 'Birria Tacos', status: 'Optimal' },
    { id: 'food2', name: 'United Grill (Sec 208)', type: 'Food', queueTime: 22, popularItem: 'Championship Burgers', status: 'Crowded' },
    { id: 'food3', name: 'El Azteca Drinks (Sec 115)', type: 'Beverage', queueTime: 14, popularItem: 'Agua Fresca', status: 'Normal' },
    { id: 'food4', name: 'World Cup Merch (East Plaza)', type: 'Retail', queueTime: 28, popularItem: 'Official Match Ball', status: 'Crowded' },
    { id: 'food5', name: 'Eco-Bites (Sec 312)', type: 'Food', queueTime: 4, popularItem: 'Vegan Wrap', status: 'Optimal' }
];

export const INITIAL_TRANSIT = [
    { id: 'metro', name: 'Metro Line 1 (Stadium Stn)', waitTime: 4, status: 'Optimal', frequency: '2 mins', capacityLoad: '82%' },
    { id: 'shuttle', name: 'Shuttle Bus (Downtown Express)', waitTime: 15, status: 'Delayed', frequency: '8 mins', capacityLoad: '95%' },
    { id: 'rideshare', name: 'Rideshare Zone (Lot G)', waitTime: 25, status: 'Congested', frequency: 'N/A', capacityLoad: 'N/A' },
    { id: 'bike', name: 'Micro-mobility (Active Way)', waitTime: 0, status: 'Optimal', frequency: 'Immediate', capacityLoad: '15%' }
];

export const INCIDENT_TEMPLATES = [
    {
        type: 'Crowd Bottleneck',
        title: 'Crowd Congestion at Exit Ramp 3',
        description: 'High density bottleneck reported at North Stand Exit Ramp 3 after halftime. Flow rate has slowed below 1.2 m/s.',
        severity: 'Medium',
        location: 'North Stand, Ramp 3',
        reportedBy: 'CCTV AI Vision'
    },
    {
        type: 'Medical Alert',
        title: 'Heat Exhaustion in Sector 112',
        description: 'Fan reporting severe dizziness and signs of heat exhaustion in Row 18, Seat 24. Requires medical responder assistance.',
        severity: 'High',
        location: 'Sector 112, Row 18',
        reportedBy: 'Volunteer Mobile App'
    },
    {
        type: 'Access Control',
        title: 'Scanner Outage at Gate C Lane 4',
        description: 'RFID turnstile scanner fails to read digital ticket QR codes. Ticket holders starting to queue heavily in lanes 3 and 4.',
        severity: 'Medium',
        location: 'Gate C, Entrance Lane 4',
        reportedBy: 'Gate Supervisor'
    },
    {
        type: 'Safety Hazard',
        title: 'Liquid Spill near Concession B',
        description: 'Large soda spill near the main concourse outside Section 208. Slip hazard for passing fans.',
        severity: 'Low',
        location: 'Concourse, Near Section 208',
        reportedBy: 'Cleaning Staff Patrol'
    },
    {
        type: 'Multilingual Support',
        title: 'Language Barrier at Info Desk West',
        description: 'A group of French-speaking supporters are struggling to find their hospitality lounge. Info desk agent requests live translation.',
        severity: 'Low',
        location: 'West Plaza Info Desk',
        reportedBy: 'Information Desk Staff'
    }
];

export class StadiumTelemetrySimulator {
    constructor() {
        this.gates = [...INITIAL_GATES];
        this.concessions = [...INITIAL_CONCESSIONS];
        this.transit = [...INITIAL_TRANSIT];
        this.sectors = [...STADIUM_SECTORS];
        this.incidents = [];
        this.listeners = [];
        
        // Add default initial incidents
        this.triggerNewIncident();
    }

    subscribe(callback) {
        this.listeners.push(callback);
        // Call immediately with initial data
        callback(this.getData());
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notify() {
        const data = this.getData();
        this.listeners.forEach(listener => listener(data));
    }

    getData() {
        return {
            gates: this.gates,
            concessions: this.concessions,
            transit: this.transit,
            sectors: this.sectors,
            incidents: this.incidents
        };
    }

    // Simulate fluctuations in stadium wait times, gate flows, etc.
    updateTelemetry() {
        // Gates
        this.gates.forEach(gate => {
            // Random change to queue times (-3 to +3 minutes)
            let diff = Math.floor(Math.random() * 7) - 3;
            gate.queueTime = Math.max(2, gate.queueTime + diff);
            
            // Adjust throughput based on queue
            gate.throughput = Math.max(10, Math.floor(gate.queueTime * 5 + (Math.random() * 20 - 10)));
            
            // Set status label
            if (gate.queueTime < 10) gate.status = 'Optimal';
            else if (gate.queueTime <= 20) gate.status = 'Normal';
            else gate.status = 'Crowded';
        });

        // Concessions
        this.concessions.forEach(c => {
            let diff = Math.floor(Math.random() * 5) - 2;
            c.queueTime = Math.max(1, c.queueTime + diff);
            if (c.queueTime < 10) c.status = 'Optimal';
            else if (c.queueTime <= 18) c.status = 'Normal';
            else c.status = 'Crowded';
        });

        // Transit
        this.transit.forEach(t => {
            if (t.id === 'rideshare') {
                t.waitTime = Math.max(10, t.waitTime + (Math.floor(Math.random() * 5) - 2));
            } else if (t.id === 'shuttle') {
                t.waitTime = Math.max(5, t.waitTime + (Math.floor(Math.random() * 7) - 3));
                t.status = t.waitTime > 15 ? 'Delayed' : 'Normal';
            } else if (t.id === 'metro') {
                t.waitTime = Math.max(1, t.waitTime + (Math.floor(Math.random() * 3) - 1));
            }
        });

        // Sectors
        this.sectors.forEach(s => {
            // Random occupancy shifts
            let diff = Math.floor(Math.random() * 100) - 40;
            s.current = Math.min(s.capacity, Math.max(1000, s.current + diff));
            
            // Determine density
            let density = s.current / s.capacity;
            if (density < 0.8) s.safetyRating = 'Optimal';
            else if (density < 0.95) s.safetyRating = 'Dense';
            else s.safetyRating = 'Critical';
        });

        this.notify();
    }

    triggerNewIncident() {
        const template = INCIDENT_TEMPLATES[Math.floor(Math.random() * INCIDENT_TEMPLATES.length)];
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const newIncident = {
            id: 'INC-' + Math.floor(1000 + Math.random() * 9000),
            timestamp,
            ...template,
            status: 'Active',
            actionPlan: null
        };
        
        this.incidents.unshift(newIncident);
        
        // Keep maximum of 10 incidents for the display
        if (this.incidents.length > 10) {
            this.incidents.pop();
        }

        this.notify();
        return newIncident;
    }

    resolveIncident(id) {
        const incident = this.incidents.find(i => i.id === id);
        if (incident) {
            incident.status = 'Resolved';
            this.notify();
        }
    }
}
