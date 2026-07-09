// app.js
// Platform Controller and UI Orchestration for Arena360 AI

import { StadiumTelemetrySimulator } from './mock-data.js';
import { GenAIEngine } from './ai-engine.js';

// Instantiate core modules
const simulator = new StadiumTelemetrySimulator();
const aiEngine = new GenAIEngine();

// Chart instances
let gateChartInstance = null;
let sectorChartInstance = null;

// Audio context helper for telemetry & alert beeps
function playAlertSound(type = 'info') {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if (type === 'high') {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
            oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        } else {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.15);
        }
    } catch (e) {
        console.warn('Audio Context block or unsupported browser:', e);
    }
}

// ----------------------------------------------------
// UI INITIALIZATION
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initViewToggles();
    initCompanionTabs();
    initTelemetrySub();
    initChatBot();
    initWayfinder();
    initIncidentHandler();

    // Start live updates loop
    setInterval(() => {
        simulator.updateTelemetry();
    }, 5000);

    // Random Incident Trigger loop (every 18 seconds, 40% chance of new incident)
    setInterval(() => {
        if (Math.random() < 0.4) {
            const newIncident = simulator.triggerNewIncident();
            showToastAlert(newIncident);
            playAlertSound(newIncident.severity === 'High' ? 'high' : 'info');
        }
    }, 18000);
});

// View mode switcher: Command Center (Desktop) vs Fan Companion (Mobile)
function initViewToggles() {
    const btnCommand = document.getElementById('btn-view-command');
    const btnFan = document.getElementById('btn-view-fan');
    const panelCommand = document.getElementById('panel-command');
    const panelFan = document.getElementById('panel-fan');

    btnCommand.addEventListener('click', () => {
        btnCommand.classList.add('active');
        btnFan.classList.remove('active');
        panelCommand.classList.add('active-view');
        panelFan.classList.remove('active-view');
        
        // Re-render charts when visible
        setTimeout(renderCharts, 50);
    });

    btnFan.addEventListener('click', () => {
        btnFan.classList.add('active');
        btnCommand.classList.remove('active');
        panelFan.classList.add('active-view');
        panelCommand.classList.remove('active-view');
    });
}

// Fan companion sub-tabs switcher (Concierge vs Radar vs Wayfinder)
function initCompanionTabs() {
    const tabBtns = document.querySelectorAll('.mobile-nav-btn');
    const subScreens = document.querySelectorAll('.mobile-sub-screen');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            subScreens.forEach(s => s.classList.remove('active-sub'));

            btn.classList.add('active');
            const targetScreenId = `screen-${btn.dataset.tab}`;
            document.getElementById(targetScreenId).classList.add('active-sub');
        });
    });
}

// ----------------------------------------------------
// TELEMETRY & DATA BINDING
// ----------------------------------------------------
function initTelemetrySub() {
    // Subscribe to simulator data updates
    simulator.subscribe(data => {
        updateStatsWidgets(data);
        updateGateRadarLists(data);
        updateIncidentFeedList(data);
        updateSustainabilityWidget(data);
        updateChartData(data);
    });
}

// Update Top stats (e.g. Ingress progress, energy grids)
function updateStatsWidgets(data) {
    const totalCap = data.sectors.reduce((acc, s) => acc + s.capacity, 0);
    const totalCur = data.sectors.reduce((acc, s) => acc + s.current, 0);
    
    document.getElementById('stat-total-occupancy').textContent = totalCur.toLocaleString();
    document.getElementById('stat-occupancy-percent').textContent = `${Math.round((totalCur / totalCap) * 100)}%`;
    
    const activeIncidents = data.incidents.filter(i => i.status === 'Active').length;
    document.getElementById('stat-active-incidents').textContent = activeIncidents;
    const incidentsBox = document.getElementById('stat-active-incidents').closest('.telemetry-card');
    if (activeIncidents > 0) {
        incidentsBox.classList.add('danger-card');
    } else {
        incidentsBox.classList.remove('danger-card');
    }

    const crowdedGates = data.gates.filter(g => g.status === 'Crowded').length;
    document.getElementById('stat-congested-gates').textContent = crowdedGates;
    const gatesBox = document.getElementById('stat-congested-gates').closest('.telemetry-card');
    if (crowdedGates > 0) {
        gatesBox.classList.add('warning-card');
    } else {
        gatesBox.classList.remove('warning-card');
    }

    // Dynamic environmental tracking metrics
    const sustainReport = aiEngine.generateSustainabilityReport(data.sectors, data.gates, data.concessions);
    document.getElementById('stat-energy-savings').textContent = `${sustainReport.energySavingKw} kW`;
}

// Render dynamic elements inside Fan Companion lists (Gate Radar / Transit Hub)
function updateGateRadarLists(data) {
    // 1. Gates
    const gatesList = document.getElementById('companion-gates-list');
    if (gatesList) {
        gatesList.innerHTML = data.gates.map(gate => {
            let statusColor = 'var(--success)';
            if (gate.status === 'Normal') statusColor = 'var(--warning)';
            if (gate.status === 'Crowded') statusColor = 'var(--danger)';
            
            return `
                <div class="mobile-info-card" style="border-left: 3px solid ${statusColor}">
                    <div class="mobile-info-left">
                        <div>
                            <div class="mobile-info-title">${gate.name}</div>
                            <div class="mobile-info-subtitle">${gate.securityOpen} Security Lanes Open</div>
                        </div>
                    </div>
                    <div class="mobile-info-val" style="color: ${statusColor}">${gate.queueTime}m wait</div>
                </div>
            `;
        }).join('');
    }

    // 2. Concessions
    const concessionList = document.getElementById('companion-concessions-list');
    if (concessionList) {
        concessionList.innerHTML = data.concessions.map(c => {
            let statusColor = 'var(--success)';
            if (c.status === 'Normal') statusColor = 'var(--warning)';
            if (c.status === 'Crowded') statusColor = 'var(--danger)';

            return `
                <div class="mobile-info-card" style="border-left: 3px solid ${statusColor}">
                    <div class="mobile-info-left">
                        <div>
                            <div class="mobile-info-title">${c.name}</div>
                            <div class="mobile-info-subtitle">Popular: ${c.popularItem}</div>
                        </div>
                    </div>
                    <div class="mobile-info-val" style="color: ${statusColor}">${c.queueTime}m line</div>
                </div>
            `;
        }).join('');
    }

    // 3. Transit
    const transitList = document.getElementById('companion-transit-list');
    if (transitList) {
        transitList.innerHTML = data.transit.map(t => {
            let statusColor = 'var(--success)';
            if (t.status === 'Delayed') statusColor = 'var(--warning)';
            if (t.status === 'Congested') statusColor = 'var(--danger)';

            return `
                <div class="mobile-info-card" style="border-left: 3px solid ${statusColor}">
                    <div class="mobile-info-left">
                        <div>
                            <div class="mobile-info-title">${t.name}</div>
                            <div class="mobile-info-subtitle">Freq: ${t.frequency} | Load: ${t.capacityLoad}</div>
                        </div>
                    </div>
                    <div class="mobile-info-val" style="color: ${statusColor}">${t.waitTime}m wait</div>
                </div>
            `;
        }).join('');
    }
}

// ----------------------------------------------------
// CHART INTEGRATION
// ----------------------------------------------------
function renderCharts() {
    const data = simulator.getData();
    
    // 1. Gate Queue Times Chart
    const ctxGate = document.getElementById('gateQueueChart');
    if (ctxGate) {
        const labels = data.gates.map(g => g.name.replace(' (', '\n('));
        const queueTimes = data.gates.map(g => g.queueTime);
        const colors = data.gates.map(g => {
            if (g.status === 'Optimal') return 'rgba(16, 185, 129, 0.7)';
            if (g.status === 'Normal') return 'rgba(249, 115, 22, 0.7)';
            return 'rgba(239, 68, 68, 0.7)';
        });
        const borderColors = data.gates.map(g => {
            if (g.status === 'Optimal') return 'var(--success)';
            if (g.status === 'Normal') return 'var(--warning)';
            return 'var(--danger)';
        });

        if (gateChartInstance) {
            gateChartInstance.destroy();
        }

        gateChartInstance = new Chart(ctxGate, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Gate Queue wait times (minutes)',
                    data: queueTimes,
                    backgroundColor: colors,
                    borderColor: borderColors,
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.6)' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.6)', font: { size: 10 } }
                    }
                }
            }
        });
    }

    // 2. Sector capacity load chart
    const ctxSector = document.getElementById('sectorCapacityChart');
    if (ctxSector) {
        const labels = data.sectors.map(s => s.name);
        const loads = data.sectors.map(s => Math.round((s.current / s.capacity) * 100));
        
        if (sectorChartInstance) {
            sectorChartInstance.destroy();
        }

        sectorChartInstance = new Chart(ctxSector, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: loads,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.6)',
                        'rgba(168, 85, 247, 0.6)',
                        'rgba(245, 158, 11, 0.6)',
                        'rgba(16, 185, 129, 0.6)'
                    ],
                    borderColor: [
                        'var(--primary)',
                        'var(--secondary)',
                        'var(--accent)',
                        'var(--success)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: 'rgba(255, 255, 255, 0.6)', boxWidth: 10, font: { size: 10 } }
                    }
                }
            }
        });
    }
}

function updateChartData(data) {
    if (gateChartInstance) {
        gateChartInstance.data.datasets[0].data = data.gates.map(g => g.queueTime);
        gateChartInstance.data.datasets[0].backgroundColor = data.gates.map(g => {
            if (g.status === 'Optimal') return 'rgba(16, 185, 129, 0.7)';
            if (g.status === 'Normal') return 'rgba(249, 115, 22, 0.7)';
            return 'rgba(239, 68, 68, 0.7)';
        });
        gateChartInstance.update('none'); // silent update
    }

    if (sectorChartInstance) {
        sectorChartInstance.data.datasets[0].data = data.sectors.map(s => Math.round((s.current / s.capacity) * 100));
        sectorChartInstance.update('none');
    }
}

// ----------------------------------------------------
// SUSTAINABILITY RECS & ENERGY
// ----------------------------------------------------
function updateSustainabilityWidget(data) {
    const report = aiEngine.generateSustainabilityReport(data.sectors, data.gates, data.concessions);
    
    // Fill slider levels
    const fillEnergy = document.getElementById('sustain-energy-fill');
    if (fillEnergy) fillEnergy.style.width = '75%'; // Static Solar battery capacity load visualizer

    const fillWaste = document.getElementById('sustain-waste-fill');
    const wasteValue = document.getElementById('sustain-waste-value');
    if (fillWaste && wasteValue) {
        if (report.trashCapacityStatus === "High Density") {
            fillWaste.style.width = '92%';
            wasteValue.textContent = "92% (High)";
            wasteValue.style.color = 'var(--danger)';
        } else {
            fillWaste.style.width = '48%';
            wasteValue.textContent = "48% (Optimal)";
            wasteValue.style.color = 'var(--success)';
        }
    }

    // Recommendation list
    const container = document.getElementById('sustainability-recommendation-list');
    if (container) {
        container.innerHTML = report.recommendations.map(rec => `
            <div class="sustain-rec-item">
                <div class="sustain-rec-title">${rec.title}</div>
                <div class="sustain-rec-desc">[${rec.zone}] ${rec.desc}</div>
            </div>
        `).join('');
    }
}

// ----------------------------------------------------
// INCIDENT FEED & DISPATCH LOGIC
// ----------------------------------------------------
let activeIncidentId = null;

function updateIncidentFeedList(data) {
    const listElement = document.getElementById('incident-list-container');
    if (!listElement) return;

    if (data.incidents.length === 0) {
        listElement.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No active incidents.</div>`;
        return;
    }

    listElement.innerHTML = data.incidents.map(inc => {
        let badgeClass = 'badge-low';
        if (inc.severity === 'High') badgeClass = 'badge-high';
        else if (inc.severity === 'Medium') badgeClass = 'badge-medium';

        const isSelected = inc.id === activeIncidentId ? 'selected' : '';
        const resolvedTag = inc.status === 'Resolved' ? `<span style="color: var(--success); font-weight:700;">✓ Resolved</span>` : inc.reportedBy;

        return `
            <div class="incident-item ${isSelected}" data-id="${inc.id}">
                <div class="incident-meta">
                    <span class="incident-id">${inc.id} • ${inc.timestamp}</span>
                    <span class="badge ${badgeClass}">${inc.severity}</span>
                </div>
                <div class="incident-title">${inc.title}</div>
                <div class="incident-desc">${inc.description}</div>
                <div class="incident-location-row">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        ${inc.location}
                    </span>
                    <span>${resolvedTag}</span>
                </div>
            </div>
        `;
    }).join('');

    // Bind click events
    listElement.querySelectorAll('.incident-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            selectIncident(id);
        });
    });
}

function selectIncident(id) {
    activeIncidentId = id;
    
    // Re-highlight list
    document.querySelectorAll('.incident-item').forEach(item => {
        if (item.dataset.id === id) item.classList.add('selected');
        else item.classList.remove('selected');
    });

    const data = simulator.getData();
    const incident = data.incidents.find(i => i.id === id);
    if (!incident) return;

    // Get blueprint from GenAI Engine
    const blueprint = aiEngine.analyzeIncident(incident);
    renderIncidentBlueprint(blueprint, incident.status);
}

function renderIncidentBlueprint(blueprint, status) {
    const emptyState = document.getElementById('ai-empty-blueprint');
    const activeState = document.getElementById('ai-active-blueprint');
    
    if (emptyState && activeState) {
        emptyState.style.display = 'none';
        activeState.style.display = 'flex';
    }

    document.getElementById('bp-title').textContent = blueprint.title;
    document.getElementById('bp-id').textContent = blueprint.id;
    document.getElementById('bp-severity').textContent = blueprint.severity;
    
    const severityBadge = document.getElementById('bp-severity');
    severityBadge.className = 'ai-badge-chip';
    if (blueprint.severity === 'High') {
        severityBadge.style.background = 'rgba(239, 68, 68, 0.2)';
        severityBadge.style.color = 'var(--danger)';
    } else {
        severityBadge.style.background = 'rgba(99, 102, 241, 0.2)';
        severityBadge.style.color = 'var(--primary)';
    }

    // Reasoning Chain
    document.getElementById('bp-reasoning-log').innerHTML = blueprint.reasoningChain.join('<br>');

    // Dispatched Units
    const unitsRow = document.getElementById('bp-dispatched-units');
    unitsRow.innerHTML = blueprint.dispatchedUnits.map(unit => `
        <span class="unit-chip">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${unit}
        </span>
    `).join('');

    // Actions List
    const actionsList = document.getElementById('bp-actions-list');
    actionsList.innerHTML = blueprint.immediateActions.map((action, idx) => `
        <li class="blueprint-action-item">
            <span class="blueprint-action-num">${idx + 1}</span>
            <span>${action}</span>
        </li>
    `).join('');

    // Broadcast message
    document.getElementById('bp-broadcast-text').textContent = blueprint.broadcastTemplate;

    // Action button states
    const btnDispatch = document.getElementById('btn-bp-dispatch');
    const btnDismiss = document.getElementById('btn-bp-dismiss');

    if (status === 'Resolved') {
        btnDispatch.textContent = '✓ Resolved & Closed';
        btnDispatch.disabled = true;
        btnDispatch.style.background = 'rgba(16, 185, 129, 0.3)';
        btnDispatch.style.borderColor = 'var(--success)';
        btnDispatch.style.color = 'var(--success)';
    } else {
        btnDispatch.textContent = 'Approve Blueprint & Dispatch';
        btnDispatch.disabled = false;
        btnDispatch.style.background = '';
        btnDispatch.style.borderColor = '';
        btnDispatch.style.color = '';
    }
}

function initIncidentHandler() {
    const btnDispatch = document.getElementById('btn-bp-dispatch');
    const btnDismiss = document.getElementById('btn-bp-dismiss');

    btnDispatch.addEventListener('click', () => {
        if (!activeIncidentId) return;

        // Perform mock dispatch
        simulator.resolveIncident(activeIncidentId);
        
        // Show success notification
        showGeneralNotification('Operations Dispatched', `GenAI Dispatch instructions approved for incident ${activeIncidentId}. Resources deployed.`);
        playAlertSound('info');

        // Refresh panel with resolved state
        selectIncident(activeIncidentId);
    });

    btnDismiss.addEventListener('click', () => {
        // Reset blueprint view
        const emptyState = document.getElementById('ai-empty-blueprint');
        const activeState = document.getElementById('ai-active-blueprint');
        if (emptyState && activeState) {
            emptyState.style.display = 'flex';
            activeState.style.display = 'none';
        }
        activeIncidentId = null;
        document.querySelectorAll('.incident-item').forEach(i => i.classList.remove('selected'));
    });
}

// ----------------------------------------------------
// MOBILE COMPANION: CHATBOT ENGINE
// ----------------------------------------------------
function initChatBot() {
    const chatInput = document.getElementById('mobile-chat-input');
    const chatBtn = document.getElementById('mobile-chat-send');
    const chatArea = document.getElementById('mobile-chat-messages');
    const suggestedContainer = document.getElementById('mobile-suggested-queries');

    // Default greeting from AI
    appendBotMessage("Hello! Welcome to the FIFA World Cup 2026 Arena Companion. How can I help you find your gate, concessions, restrooms, transit routes, or review stadium security policies today?");

    // Message submit handlers
    const submitMessage = () => {
        const text = chatInput.value.trim();
        if (!text) return;

        appendUserMessage(text);
        chatInput.value = "";

        // Simulated AI response lag
        setTimeout(() => {
            const aiResponse = aiEngine.answerFanQuery(text);
            appendBotMessage(aiResponse.text, aiResponse.languageLabel, aiResponse.topic);
            playAlertSound('info');
        }, 600);
    };

    chatBtn.addEventListener('click', submitMessage);
    chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') submitMessage();
    });

    // Suggested queries click handlers
    if (suggestedContainer) {
        suggestedContainer.addEventListener('click', e => {
            const btn = e.target.closest('.suggested-btn');
            if (!btn) return;
            
            const query = btn.dataset.query;
            chatInput.value = query;
            submitMessage();
        });
    }

    function appendUserMessage(text) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble user';
        bubble.innerHTML = `
            <div>${text}</div>
            <div class="chat-bubble-time">${time}</div>
        `;
        chatArea.appendChild(bubble);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function appendBotMessage(text, langTag = null, topic = null) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble bot';
        
        let headerMarkup = "";
        if (langTag || topic) {
            headerMarkup = `
                <div class="chat-ai-indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    GenAI Concierge ${topic ? `• ${topic}` : ''} ${langTag ? `[${langTag}]` : ''}
                </div>
            `;
        }

        bubble.innerHTML = `
            ${headerMarkup}
            <div>${text}</div>
            <div class="chat-bubble-time">${time}</div>
        `;
        chatArea.appendChild(bubble);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
}

// ----------------------------------------------------
// MOBILE COMPANION: ROUTE PLANNER / WAYFINDER
// ----------------------------------------------------
function initWayfinder() {
    const standSelect = document.getElementById('nav-stand-select');
    const transitSelect = document.getElementById('nav-transit-select');
    const btnPlan = document.getElementById('btn-nav-calculate');
    const resultBox = document.getElementById('nav-results-container');

    if (!btnPlan) return;

    btnPlan.addEventListener('click', () => {
        const stand = standSelect.value;
        const transit = transitSelect.value;

        // Custom GenAI routed algorithm simulation
        let pathHtml = "";
        
        if (stand === 'south' && transit === 'metro') {
            // High Congestion Warning routing
            pathHtml = `
                <div style="font-size:0.75rem; color:var(--warning); margin-bottom:0.75rem; font-weight:600; display:flex; align-items:center; gap:4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    AI rerouted path to avoid Gate C bottlenecks.
                </div>
                <div class="route-step-item">
                    <div class="route-step-title">1. Depart South Stand Concourse</div>
                    <div class="route-step-desc">Turn Left instead of Right. Follow overhead signs to Sector 200 West access corridor.</div>
                </div>
                <div class="route-step-item success-step">
                    <div class="route-step-title">2. Pass via Gate D (West Metro Hub)</div>
                    <div class="route-step-desc">Scan out via Turnstile Lane 3. Wait time is 18 mins (saved 14 mins vs Gate C).</div>
                </div>
                <div class="route-step-item">
                    <div class="route-step-title">3. Board Metro Line 1 Platform A</div>
                    <div class="route-step-desc">Departures every 2 minutes. High volume warning, stand clear of yellow line.</div>
                </div>
                <div style="margin-top:0.75rem; font-size:0.7rem; color:var(--success); text-align:right;">
                    Estimated trip time: 24 mins • Carbon Savings: 1.4 kg CO2
                </div>
            `;
        } else {
            // General optimal routing
            pathHtml = `
                <div class="route-step-item">
                    <div class="route-step-title">1. Walk toward your nearest Stand gate</div>
                    <div class="route-step-desc">Follow the green lit directional arrows on the stadium floor.</div>
                </div>
                <div class="route-step-item success-step">
                    <div class="route-step-title">2. Scan out via Gate A (North Transit)</div>
                    <div class="route-step-desc">Fast queue clearance. Delay is under 12 mins.</div>
                </div>
                <div class="route-step-item">
                    <div class="route-step-title">3. Walk to Transit Depot</div>
                    <div class="route-step-desc">The boarding terminal for your selected option is 200m ahead on the left.</div>
                </div>
                <div style="margin-top:0.75rem; font-size:0.7rem; color:var(--success); text-align:right;">
                    Estimated trip: 16 mins • Carbon Savings: 0.8 kg CO2
                </div>
            `;
        }

        resultBox.innerHTML = pathHtml;
    });
}

// ----------------------------------------------------
// DYNAMIC OPERATIONAL TOAST ALERTS
// ----------------------------------------------------
function showToastAlert(incident) {
    const container = document.getElementById('toast-alerts-holder');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-alert';
    
    let icon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    `;
    if (incident.severity === 'High') {
        icon = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        `;
    }

    toast.innerHTML = `
        <div style="flex-shrink:0;">${icon}</div>
        <div class="toast-body">
            <div class="toast-title">${incident.severity} SEVERITY ALERT: ${incident.type}</div>
            <div class="toast-desc">${incident.title} at ${incident.location}</div>
        </div>
    `;

    container.appendChild(toast);

    // Click toast to select incident directly
    toast.addEventListener('click', () => {
        // Toggle view to command center dashboard if in Fan Companion view
        const btnCommand = document.getElementById('btn-view-command');
        if (btnCommand && !btnCommand.classList.contains('active')) {
            btnCommand.click();
        }
        selectIncident(incident.id);
        toast.remove();
    });

    // Auto dismiss after 6 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInToast 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 6000);
}

function showGeneralNotification(title, message) {
    const container = document.getElementById('toast-alerts-holder');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-alert';
    toast.style.borderColor = 'var(--success)';
    
    toast.innerHTML = `
        <div style="flex-shrink:0; color:var(--success);">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="toast-body">
            <div class="toast-title" style="color:var(--success);">${title}</div>
            <div class="toast-desc">${message}</div>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideInToast 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
