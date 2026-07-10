// ai-engine.js
// Simulated Generative AI Engine for FIFA World Cup 2026 operations

// Translation dictionary for fan concierge response localization
const TRANSLATIONS = {
    en: {
        detected: "English detected",
        greeting: "Welcome to the FIFA World Cup 2026 Arena Companion! I am your GenAI Assistant.",
        not_found: "I understand you are asking about '{topic}'. To better assist, could you specify your section number or stadium zone?",
        transit: "Based on real-time transit telemetry, Metro Line 1 is operating at high frequency (every 2 mins) but has high load (82%). For a quicker departure, we recommend using the Micro-mobility Active Way (bike sharing at Lot C) which has 0 mins wait time.",
        gate: "Gate C is currently experiencing heavy congestion (30+ min wait). If your seat is in the East or South Stands, we recommend walking 4 minutes to enter via Gate D (West Metro Hub), which currently has only a 15-minute wait time. AI-routed navigation is active.",
        food: "Looking for food? Copa Tacos (Sec 104) is rated 4.9 stars and has a short 8-minute queue. If you want a burger, United Grill at Sec 208 is popular but has a 22-minute wait. You can preorder through this app to skip the line!",
        restroom: "The nearest restrooms are located directly behind Section 112 and Section 204. The AI crowd sensors report that Section 204 restrooms currently have a shorter queue of approximately 2 minutes.",
        sustainability: "Our stadium operates under a Zero-Waste directive. Please dispose of food items in the Green Composting bins. Our GenAI system has optimized bin placement near Section 104 and 208 based on fan heatmaps.",
        accessible: "All entrances support wheelchair access. Gate B is specifically optimized for accessibility and VIP patrons, with low-floor entryways and direct elevators to the 100-level suite concourses.",
        rules: "For the FIFA World Cup 2026, backpacks larger than A4 size are not permitted inside the stadium. Clear bags (plastic/vinyl) are highly recommended. Storage lockers are available outside Gate A."
    },
    es: {
        detected: "Español detectado",
        greeting: "¡Bienvenido al Asistente del Estadio de la Copa Mundial de la FIFA 2026! Soy tu Asistente GenAI.",
        not_found: "Entiendo que preguntas sobre '{topic}'. Para ayudarte mejor, ¿podrías especificar tu número de sección o zona del estadio?",
        transit: "Según la telemetría en tiempo real, la Línea 1 del Metro opera con alta frecuencia (cada 2 min) pero con carga alta (82%). Para una salida más rápida, recomendamos usar el Carril Activo de Micro-movilidad (bicicletas en el Lote C) que no tiene espera.",
        gate: "La Puerta C experimenta congestión pesada (30+ min de espera). Si tu asiento está en las tribunas Este o Sur, recomendamos caminar 4 minutos para entrar por la Puerta D (Metro Oeste), que solo tiene 15 minutos de espera. Navegación guiada por IA activada.",
        food: "¿Buscas comida? Copa Tacos (Sec 104) tiene 4.9 estrellas y una fila corta de 8 minutos. United Grill (Sec 208) es muy popular pero tiene 22 minutos de espera. ¡Puedes preordenar en esta app para evitar la fila!",
        restroom: "Los baños más cercanos están detrás de la Sección 112 y 204. Los sensores de multitud de la IA reportan que los baños de la Sección 204 tienen una fila más corta de aproximadamente 2 minutos.",
        sustainability: "El estadio opera bajo una directiva de Residuo Cero. Por favor, desecha los restos de comida en los contenedores verdes de compostaje. El sistema GenAI optimizó los contenedores en las secciones 104 y 208 según el mapa de calor.",
        accessible: "Todas las entradas tienen acceso para sillas de ruedas. La Puerta B está optimizada para accesibilidad y VIP, con rampas de pendiente baja y ascensores directos a las suites del nivel 100.",
        rules: "Para la Copa Mundial 2026, no se permiten mochilas más grandes que el tamaño A4. Se recomiendan bolsas transparentes. Hay casilleros de almacenamiento fuera de la Puerta A."
    },
    fr: {
        detected: "Français détecté",
        greeting: "Bienvenue sur le compagnon de stade de la Coupe du Monde de la FIFA 2026 ! Je suis votre assistant GenAI.",
        not_found: "Je comprends que vous posez des questions sur '{topic}'. Pour mieux vous aider, pouvez-vous spécifier votre section ou zone du stade ?",
        transit: "D'après la télémétrie en temps réel, la ligne 1 du métro fonctionne à haute fréquence (toutes les 2 min) mais affiche une charge élevée (82%). Pour un départ plus rapide, nous vous conseillons le Micro-mobility Active Way (vélos au parking C) avec 0 min d'attente.",
        gate: "La porte C est actuellement saturée (plus de 30 min d'attente). Si votre siège est dans la tribune Est ou Sud, nous vous conseillons de marcher 4 minutes pour entrer par la porte D, qui n'a que 15 min d'attente.",
        food: "Envie de manger ? Copa Tacos (Sec 104) est noté 4.9 étoiles avec seulement 8 minutes d'attente. United Grill (Sec 208) est populaire mais a 22 minutes d'attente. Commandez via l'application pour éviter la file !",
        restroom: "Les toilettes les plus proches se trouvent juste derrière les sections 112 et 204. Les capteurs d'affluence indiquent que les toilettes de la section 204 ont une attente plus courte (environ 2 minutes).",
        sustainability: "Notre stade applique une directive Zéro Déchet. Veuillez jeter les aliments dans les bacs de compostage verts. L'IA a positionné les bacs de manière optimale près des sections 104 et 208.",
        accessible: "Toutes les entrées sont accessibles aux fauteuils roulants. La porte B est spécialement optimisée pour l'accessibilité et les VIP, avec des accès de plain-pied et des ascenseurs directs vers le niveau 100.",
        rules: "Pour la Coupe du Monde de la FIFA 2026, les sacs à dos plus grands que le format A4 sont interdits. Les sacs transparents sont fortement recommandés. Des consignes sont disponibles devant la Porte A."
    },
    pt: {
        detected: "Português detectado",
        greeting: "Bem-vindo ao assistente da Copa do Mundo FIFA 2026! Sou seu assistente GenAI.",
        not_found: "Entendo que você está perguntando sobre '{topic}'. Para ajudar melhor, poderia especificar sua seção ou zona do estádio?",
        transit: "Com base na telemetria de trânsito em tempo real, a Linha 1 do Metrô opera com alta frequência (cada 2 min) mas carga alta (82%). Para uma saída mais rápida, recomendamos o Micro-mobility Active Way (bicicletas no Estacionamento C) com 0 min de espera.",
        gate: "O Portão C está congestionado (30+ min de espera). Se seu assento for nas arquibancadas Leste ou Sul, recomendamos caminhar 4 minutos para entrar pelo Portão D (Metro Oeste), que tem apenas 15 minutos de espera.",
        food: "Procurando comida? Copa Tacos (Sec 104) tem avaliação 4.9 e apenas 8 minutos de fila. O United Grill (Sec 208) é popular, mas tem 22 minutos de espera. Você pode pedir pelo app para pular a fila!",
        restroom: "Os banheiros mais próximos estão atrás das seções 112 e 204. Nossos sensores de multidão indicam que os banheiros da seção 204 têm fila de apenas 2 minutos.",
        sustainability: "O estádio opera com diretriz de Resíduo Zero. Descarte alimentos nas lixeiras verdes de compostagem. O sistema GenAI otimizou o posicionamento das lixeiras perto das seções 104 e 208.",
        accessible: "Todas as entradas são acessíveis. O Portão B é otimizado para acessibilidade e VIPs, com rampas de inclinação suave e elevadores diretos para as suítes do nível 100.",
        rules: "Para a Copa do Mundo FIFA 2026, não são permitidas mochilas maiores que o tamanho A4. Bolsas transparentes são recomendadas. Há armários disponíveis fora do Portão A."
    },
    ar: {
        detected: "العربية تم اكتشافها",
        greeting: "مرحباً بك في مساعد كأس العالم لكرة القدم FIFA 2026! أنا مساعدك الذكي GenAI.",
        not_found: "أفهم أنك تسأل عن '{topic}'. لمساعدتك بشكل أفضل، هل يمكنك تحديد رقم القسم أو منطقة الملعب؟",
        transit: "بناءً على قياسات حركة المرور الفورية، يعمل خط المترو 1 بتردد عالٍ (كل دقيقتين) ولكن بحمل مرتفع (82٪). للمغادرة الأسرع، نوصي باستخدام مسار الدراجات النشط (مواقف الدراجات في موقف C) حيث لا يوجد وقت انتظار.",
        gate: "البوابة C تشهد حاليًا ازدحامًا شديدًا (انتظار 30+ دقيقة). إذا كان مقعدك في المدرجات الشرقية أو الجنوبية، فنوصي بالمشي لمدة 4 دقائق للدخول عبر البوابة D (محطة المترو الغربية)، والتي تستغرق 15 دقيقة فقط حاليًا.",
        food: "تبحث عن طعام؟ كوبا تاكوس (القسم 104) مقيم بـ 4.9 نجوم وله طابور قصير مدته 8 دقائق. يونايتد غريل (القسم 208) شائع ولكن الانتظار فيه 22 دقيقة. يمكنك الطلب مسبقاً عبر التطبيق لتخطي الطابور!",
        restroom: "تقع أقرب دورات المياه خلف القسمين 112 و 204 مباشرةً. تشير أجهزة استشعار الحشود الذكية إلى أن دورات مياه القسم 204 بها طابور أقصر يبلغ دقيقتين تقريبًا.",
        sustainability: "يعمل ملعبنا وفقًا لتوجيهات خالية من النفايات. يرجى التخلص من بقايا الطعام في سلال التسميد الخضراء. قام نظام GenAI بتحسين توزيع السلال بالقرب من القسمين 104 و 208.",
        accessible: "جميع المداخل تدعم الكراسي المتحركة. تم تحسين البوابة B خصيصاً لذوي الاحتياجات الخاصة وكبار الشخصيات، مع مداخل منخفضة ومصاعد مباشرة إلى أجنحة المستوى 100.",
        rules: "لكأس العالم FIFA 2026، لا يُسمح بالحقائب التي تزيد عن حجم A4 داخل الملعب. نوصي بشدة بالحقائب الشفافة. تتوفر خزائن خارج البوابة A."
    }
};

export class GenAIEngine {
    constructor() {
        this.recentAnalyses = [];
        this.apiKey = '';
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    /**
     * Analyzes a reported venue incident using Gemini API or simulated fallback.
     */
    async analyzeIncident(incident) {
        const key = this.apiKey || (typeof window !== 'undefined' ? window.localStorage.getItem('gemini_api_key') : '') || (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '');
        if (key) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are the GenAI Incident Resolver Co-Pilot for the FIFA World Cup 2026 Venue Command Center.
Your task is to analyze a reported stadium incident and output a step-by-step resolution blueprint.

Incident details:
- ID: ${incident.id}
- Title: ${incident.title}
- Type: ${incident.type}
- Description: ${incident.description}
- Severity: ${incident.severity}
- Location: ${incident.location}
- Reported By: ${incident.reportedBy}

Respond ONLY as a JSON object with this exact schema:
{
  "reasoningChain": [
    "1. [IMPACT ASSESSMENT]: ...",
    "2. [SAFETY CHECK]: ...",
    "3. [CROWD FLOW CONTROL]: ..."
  ],
  "immediateActions": [
    "Action 1...",
    "Action 2...",
    "Action 3..."
  ],
  "dispatchedUnits": [
    "Unit name 1",
    "Unit name 2"
  ],
  "broadcastTemplate": "Public address announcement script..."
}`
                            }]
                        }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates[0].content.parts[0].text.trim();
                    const jsonText = text.replace(/^```json/, '').replace(/```$/, '').trim();
                    const parsed = JSON.parse(jsonText);
                    
                    const blueprint = {
                        id: incident.id,
                        timestamp: new Date().toLocaleTimeString(),
                        incidentType: incident.type,
                        title: incident.title,
                        severity: incident.severity,
                        location: incident.location,
                        reasoningChain: parsed.reasoningChain || [],
                        immediateActions: parsed.immediateActions || [],
                        broadcastTemplate: parsed.broadcastTemplate || '',
                        dispatchedUnits: parsed.dispatchedUnits || []
                    };

                    this.recentAnalyses.unshift(blueprint);
                    return blueprint;
                }
            } catch (err) {
                console.warn('Gemini API incident analysis failed, using local fallback:', err);
            }
        }

        return this.analyzeIncidentSync(incident);
    }

    /**
     * Simulates GenAI chain-of-thought analysis for a reported venue incident.
     * Generates a step-by-step resolution blueprint, communication plan, and resources.
     */
    analyzeIncidentSync(incident) {
        let blueprint = {
            id: incident.id,
            timestamp: new Date().toLocaleTimeString(),
            incidentType: incident.type,
            title: incident.title,
            severity: incident.severity,
            location: incident.location,
            reasoningChain: [],
            immediateActions: [],
            broadcastTemplate: "",
            dispatchedUnits: []
        };

        // Chain of thought simulation
        blueprint.reasoningChain.push(`1. [IMPACT ASSESSMENT]: Severity classified as ${incident.severity}. Target location: ${incident.location}.`);
        
        if (incident.severity === 'High') {
            blueprint.reasoningChain.push("2. [SAFETY CHECK]: Immediate health threat detected. Standard protocols mandate dispatching paramedic units and alert staff in parallel.");
            blueprint.reasoningChain.push("3. [CROWD FLOW CONTROL]: Ensure surrounding ingress/egress is clear for emergency vehicle access.");
        } else if (incident.severity === 'Medium') {
            blueprint.reasoningChain.push("2. [FLOW ANALYSIS]: Bottleneck detected. Threat of crowd crush if not mitigated before peak transit window.");
            blueprint.reasoningChain.push("3. [ROUTING ADJUSTMENT]: Suggest updating stadium digital signage to redirect foot traffic to auxiliary paths.");
        } else {
            blueprint.reasoningChain.push("2. [RESOURCE SCHEDULING]: Maintenance/cleaning dispatch warranted. Low urgency, assign local patrol unit.");
        }

        // Specific actions & dispatch based on template types
        switch (incident.type) {
            case 'Medical Alert':
                blueprint.immediateActions = [
                    "Dispatch Medical Cart #3 and Medic Team Beta to Sector 112 via tunnel entrance 2B.",
                    "Alert Section 112 Lead Steward to locate row 18 seat 24 and assist medical responders upon arrival.",
                    "Set overhead display screens near Sector 112 to indicate emergency response active, reminding fans to keep aisles clear."
                ];
                blueprint.dispatchedUnits = ["Medic Team Beta", "Sector 112 Security Steward"];
                blueprint.broadcastTemplate = "Attention fans in Section 112: Medical responders are entering the area. Please keep the access stairwell and aisles clear. Thank you for your cooperation.";
                break;

            case 'Crowd Bottleneck':
                blueprint.immediateActions = [
                    "Activate secondary exit gates at Gate B and D to absorb egress pressure.",
                    "Update digital guidance signage above Exit Ramp 3 to dynamically point to the West Concourse bypass path.",
                    "Dispatch Crowd Management Team to Ramp 3 to manual route fans and break up group clusters."
                ];
                blueprint.dispatchedUnits = ["Crowd Patrol Unit 4", "Digital Signage Operator"];
                blueprint.broadcastTemplate = "FIFA World Cup Egress Announcement: To ensure a fast and comfortable exit, fans exiting North Stand are requested to follow the green lit arrows on the floor toward the West Concourse exit path.";
                break;

            case 'Access Control':
                blueprint.immediateActions = [
                    "Dispatch Technical Support Team Delta to Gate C Entrance Lane 4.",
                    "Temporarily redirect Gate C digital screens to distribute Lane 4 queues to Lanes 2, 3, and 5.",
                    "Provide gate stewards with handheld backup scanning devices to process fans manually."
                ];
                blueprint.dispatchedUnits = ["IT Infrastructure Tech Delta", "Gate C Steward Pool"];
                blueprint.broadcastTemplate = "Important Notice for Gate C: We are experiencing minor scanner delays in Lane 4. Please look for the staff holding handheld scanners who will assist you in entering through lanes 2 or 5.";
                break;

            case 'Safety Hazard':
                blueprint.immediateActions = [
                    "Dispatch Cleaning Crew Lead to concourse area outside Section 208 with absorbent cleanup kit.",
                    "Place wet floor warning cone at the spill location.",
                    "Request supervisor patrol to confirm cleanup is completed and slip hazard is mitigated."
                ];
                blueprint.dispatchedUnits = ["Sanitation Duty Crew Unit 7"];
                blueprint.broadcastTemplate = "[Internal staff notice dispatched via smart radios. No public audio announcement needed for low severity spill.]";
                break;

            case 'Multilingual Support':
                blueprint.immediateActions = [
                    "Activate Mobile Translation Sub-agent on Info Desk tablet.",
                    "Dispatch multilingual volunteer helper fluent in French (ID Vol-4209) to West Plaza Info Desk.",
                    "Generate standard directions and VIP Lounge lounge pass verification instructions translated into French."
                ];
                blueprint.dispatchedUnits = ["Vol-4209 (Multilingual Steward - FR/EN)"];
                blueprint.broadcastTemplate = "Bonjour et bienvenue à la Coupe du Monde de la FIFA 2026 ! Veuillez vous présenter à l'accueil Ouest, notre agent d'accueil va vous escorter.";
                break;

            default:
                blueprint.immediateActions = [
                    `Investigate reported issue at ${incident.location}.`,
                    "Monitor surveillance cameras for status updates.",
                    "Report back status to operations center."
                ];
                blueprint.dispatchedUnits = ["General Patrol Unit"];
                blueprint.broadcastTemplate = "Please follow instructions from stadium wardens.";
                break;
        }

        this.recentAnalyses.unshift(blueprint);
        return blueprint;
    }

    /**
     * Resolves queries sent by fans or volunteers using real Gemini API or local keyword fallback.
     */
    async answerFanQuery(query) {
        const key = this.apiKey || (typeof window !== 'undefined' ? window.localStorage.getItem('gemini_api_key') : '') || (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '');
        if (key) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are the GenAI Concierge for the FIFA World Cup 2026 Smart Stadium Platform.
Your task is to detect the language of the query and answer the user query accurately about the stadium.
The stadium layout rules, gate wait times, concessions and transit info are as follows:
- Gates: Gate A (North Transit, wait 12m), Gate B (VIP/Accessible, wait 5m), Gate C (East Parking, wait 32m), Gate D (West Metro Hub, wait 18m).
- Food: Copa Tacos (Sec 104, 4.9 stars, wait 8m), United Grill (Sec 208, wait 22m), El Azteca Drinks (Sec 115, wait 14m), World Cup Merch (East Plaza, wait 28m), Eco-Bites (Sec 312, wait 4m).
- Transit: Metro Line 1 (wait 4m), Shuttle Bus (wait 15m, delayed), Rideshare Zone Lot G (wait 25m), Micro-mobility (Active Way, wait 0m).
- Restrooms: behind Sec 112 and Sec 204.
- Sustainability: Zero-waste directive, Green composting bins.
- Accessibility: Gate B optimized, all entrances wheelchair accessible.
- Security rules: backpacks > A4 size not allowed, clear bags recommended. Lockers outside Gate A.

Query: "${query}"

Respond ONLY as a JSON object with this exact schema:
{
  "language": "en/es/fr/pt/ar",
  "languageLabel": "Language Name detected",
  "topic": "Category Name (e.g. Gates & Navigation, Food & Merch Concessions, Transit & Parking Routes, Restrooms & Hygiene, Sustainability & Waste Management, Accessibility Assist, Stadium Security Rules, General Inquiry)",
  "text": "Your helpful, welcoming response in the detected language (matching the tone of the World Cup concierge)."
}`
                            }]
                        }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates[0].content.parts[0].text.trim();
                    const jsonText = text.replace(/^```json/, '').replace(/```$/, '').trim();
                    const parsed = JSON.parse(jsonText);
                    return {
                        language: parsed.language || 'en',
                        languageLabel: parsed.languageLabel || 'English detected',
                        topic: parsed.topic || 'General Inquiry',
                        text: parsed.text || 'Welcome!',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                }
            } catch (err) {
                console.warn('Gemini API call failed, using local engine fallback:', err);
            }
        }

        return this.answerFanQuerySync(query);
    }

    /**
     * Resolves queries sent by fans or volunteers using semantic keyword matching.
     * Detects language and returns contextual solutions in the target language.
     */
    answerFanQuerySync(query) {
        const cleaned = query.toLowerCase().trim();
        
        // Simple language detection
        let lang = 'en';
        if (cleaned.includes('hola') || cleaned.includes('puerta') || cleaned.includes('comida') || cleaned.includes('baño') || cleaned.includes('tacos') || cleaned.includes('metro')) {
            lang = 'es';
        } else if (cleaned.includes('bonjour') || cleaned.includes('porte') || cleaned.includes('nourriture') || cleaned.includes('toilet') || cleaned.includes('metro')) {
            lang = 'fr';
        } else if (cleaned.includes('olá') || cleaned.includes('portão') || cleaned.includes('comida') || cleaned.includes('banheiro') || cleaned.includes('metro')) {
            lang = 'pt';
        } else if (cleaned.includes('مرحبا') || cleaned.includes('بوابة') || cleaned.includes('طعام') || cleaned.includes('حمام') || cleaned.includes('مترو')) {
            lang = 'ar';
        }

        const dict = TRANSLATIONS[lang];
        let responseText = "";
        let matchedTopic = "";

        if (cleaned.includes('gate') || cleaned.includes('puerta') || cleaned.includes('porte') || cleaned.includes('portão') || cleaned.includes('بوابة')) {
            responseText = dict.gate;
            matchedTopic = "Gates & Navigation";
        } else if (cleaned.includes('food') || cleaned.includes('eat') || cleaned.includes('comida') || cleaned.includes('tacos') || cleaned.includes('burger') || cleaned.includes('nourriture') || cleaned.includes('طعام')) {
            responseText = dict.food;
            matchedTopic = "Food & Merch Concessions";
        } else if (cleaned.includes('transit') || cleaned.includes('metro') || cleaned.includes('bus') || cleaned.includes('train') || cleaned.includes('rideshare') || cleaned.includes('transport') || cleaned.includes('مترو')) {
            responseText = dict.transit;
            matchedTopic = "Transit & Parking Routes";
        } else if (cleaned.includes('restroom') || cleaned.includes('toilet') || cleaned.includes('baño') || cleaned.includes('wc') || cleaned.includes('banheiro') || cleaned.includes('حمام')) {
            responseText = dict.restroom;
            matchedTopic = "Restrooms & Hygiene";
        } else if (cleaned.includes('green') || cleaned.includes('waste') || cleaned.includes('recycle') || cleaned.includes('basura') || cleaned.includes('compost') || cleaned.includes('بيئة') || cleaned.includes('sustainability')) {
            responseText = dict.sustainability;
            matchedTopic = "Sustainability & Waste Management";
        } else if (cleaned.includes('handicap') || cleaned.includes('access') || cleaned.includes('wheelchair') || cleaned.includes('silla de ruedas') || cleaned.includes('handicapé') || cleaned.includes('احتياجات')) {
            responseText = dict.accessible;
            matchedTopic = "Accessibility Assist";
        } else if (cleaned.includes('rule') || cleaned.includes('bag') || cleaned.includes('backpack') || cleaned.includes('mochila') || cleaned.includes('sac') || cleaned.includes('حقيبة')) {
            responseText = dict.rules;
            matchedTopic = "Stadium Security Rules";
        } else {
            // Default query responder using keyword extraction
            const extracted = cleaned.split(" ").slice(0, 3).join(" ");
            responseText = dict.not_found.replace('{topic}', extracted || "your request");
            matchedTopic = "General Inquiry";
        }

        return {
            language: lang,
            languageLabel: dict.detected,
            topic: matchedTopic,
            text: responseText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }

    /**
     * Generates operational smart decisions based on active stadium occupancy, temperatures, and queue loading.
     */
    generateSustainabilityReport(sectors, gates, concessions) {
        const totalCapacity = sectors.reduce((acc, curr) => acc + curr.capacity, 0);
        const totalCurrent = sectors.reduce((acc, curr) => acc + curr.current, 0);
        const occupancyPct = Math.round((totalCurrent / totalCapacity) * 100);

        let energySavingKw = 0;
        let trashCapacityStatus = "Nominal";
        let recommendations = [];

        // Dynamic resource optimization rules
        if (occupancyPct < 85) {
            const hvacOffset = 2.5; // shift thermostat offset by 2.5 degrees in lower occupied areas
            energySavingKw += 140;
            recommendations.push({
                zone: "West Stand (Family)",
                title: "Dynamic HVAC Eco-Mode active",
                desc: `Thermostat setback adjusted by +${hvacOffset}°C due to 79% occupancy. Dynamic fan velocity reduced by 15%.`
            });
        }

        const crowdedConcessions = concessions.filter(c => c.status === 'Crowded').length;
        if (crowdedConcessions > 1) {
            trashCapacityStatus = "High Density";
            recommendations.push({
                zone: "East Concourse Hub",
                title: "Reroute Waste Compactors",
                desc: "Crowded food zones are producing trash at 1.4x standard speed. Dispatched dynamic waste collection team to Section 208."
            });
        }

        const crowdedGates = gates.filter(g => g.status === 'Crowded');
        if (crowdedGates.length > 0) {
            recommendations.push({
                zone: "Stadium Entry Gates",
                title: "Lighting Intensity Offset",
                desc: `Diverted 24 kW from standby concourse floodlights to illuminated pathways near Gate C queue buffer.`
            });
        }

        // Standard recommendations
        recommendations.push({
            zone: "Solar Roof Collector Grid",
            title: "Grid Energy Arbitrage Action",
            desc: "Batteries fully charged (100% capacity). Diverting surplus 45kW solar energy to power stadium scoreboard and food stand cooking panels."
        });

        return {
            occupancyPct,
            totalAttendees: totalCurrent,
            energySavingKw,
            trashCapacityStatus,
            recommendations
        };
    }
}
