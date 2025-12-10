// Base de datos de preguntas frecuentes
const faqDatabase = {
    // Pregunta 1: Cómo empezar con voluntariado
    empezar: {
        keywords: ['empezar', 'comenzar', 'iniciar', 'cómo empezar', 'no sé cómo', 'primera vez', 'principiante'],
        responses: [
            '¡Es muy sencillo! En la plataforma encontrarás distintas oportunidades de voluntariado organizadas por temática, territorio y tipo de institución. Solo debes crear tu perfil, explorar las iniciativas disponibles y postular a la que más se ajuste a tus intereses, tiempos y habilidades. Si es tu primera vez, te recomendamos revisar también la sección de Formación, donde podrás adquirir conocimientos básicos antes de participar.'
        ]
    },
    // Pregunta 2: Sin experiencia previa
    experiencia: {
        keywords: ['experiencia', 'experiencia previa', 'sin experiencia', 'no tengo experiencia', 'primera vez', 'nuevo'],
        responses: [
            'Sí, absolutamente. Muchas oportunidades no requieren experiencia y están diseñadas justamente para personas que están comenzando.'
        ]
    },
    // Pregunta 3: Tiempo de respuesta
    respuesta: {
        keywords: ['respuesta', 'esperar', 'tiempo', 'cuánto tiempo', 'días', 'postulación', 'postulé', 'cuándo'],
        responses: [
            'Los tiempos pueden variar según cada organización. En general, las instituciones suelen responder entre 5 y 15 días hábiles desde la postulación. Te recomendamos estar atento/a a tu correo electrónico y a la mensajería interna de la plataforma. Si una oportunidad requiere contacto urgente, la organización te lo informará directamente.'
        ]
    },
    // Pregunta 4: Aprender sobre voluntariado
    aprender: {
        keywords: ['aprender', 'formación', 'cursos', 'talleres', 'conocimientos', 'capacitación', 'estudiar'],
        responses: [
            'Dentro de la plataforma encontrarás una sección de Formación con cursos, talleres y materiales descargables sobre distintas áreas del voluntariado, incluyendo gestión del riesgo de desastres, acción comunitaria, liderazgo, inclusión, medio ambiente y más.'
        ]
    },
    // Pregunta 5: Problemas con la plataforma
    problemas: {
        keywords: ['problema', 'problemas', 'dificultad', 'dificultades', 'error', 'no funciona', 'ayuda técnica', 'soporte', 'consulta'],
        responses: [
            'Si presentas dificultades técnicas o dudas sobre el funcionamiento de la plataforma, puedes escribirnos directamente a: voluntariado@injuv.gob.cl. Nuestro equipo revisará tu caso y te entregará apoyo lo antes posible. También puedes revisar la sección de Preguntas Frecuentes, que se actualiza periódicamente.'
        ]
    },
    // Pregunta 6: Beneficios del voluntariado
    beneficios: {
        keywords: ['beneficio', 'beneficios', 'para qué sirve', 'de qué sirve', 'utilidad', 'ventajas', 'por qué'],
        responses: [
            'Participar en voluntariado te permite aportar a tu comunidad y, al mismo tiempo, desarrollar habilidades personales y profesionales. A través de estas experiencias puedes fortalecer el trabajo en equipo, el liderazgo, la organización y la empatía, además de conocer nuevas realidades y ampliar tus redes. El voluntariado también es una oportunidad para adquirir formación práctica, descubrir intereses, mejorar tu empleabilidad y generar impacto positivo en temas que te importan. Además, contribuyes a construir comunidades más solidarias, resilientes y participativas.'
        ]
    },
    // Preguntas sobre registro (mantener para compatibilidad)
    registro: {
        keywords: ['registro', 'registrarse', 'crear cuenta', 'inscribirse', 'darse de alta'],
        responses: [
            'Para registrarte en la plataforma, puedes hacer clic en el botón "Iniciar Sesión" en la parte superior de la página y luego seleccionar "Crear cuenta". Necesitarás proporcionar tu información personal básica.'
        ]
    },
    // Preguntas sobre voluntariado (mantener para compatibilidad)
    voluntariado: {
        keywords: ['voluntariado', 'oportunidades', 'proyectos', 'participar', 'ayudar'],
        responses: [
            'En la plataforma encontrarás distintas oportunidades de voluntariado organizadas por temática, territorio y tipo de institución. Solo debes crear tu perfil, explorar las iniciativas disponibles y postular a la que más se ajuste a tus intereses, tiempos y habilidades.'
        ]
    }
};

// Función para encontrar la mejor respuesta
function findBestResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();
    
    // Buscar coincidencias por categoría
    for (const [category, data] of Object.entries(faqDatabase)) {
        for (const keyword of data.keywords) {
            if (message.includes(keyword)) {
                // Devolver una respuesta aleatoria de la categoría
                const randomIndex = Math.floor(Math.random() * data.responses.length);
                return {
                    response: data.responses[randomIndex],
                    category: category
                };
            }
        }
    }
    
    // Si no hay coincidencia, devolver respuesta genérica
    return {
        response: 'Gracias por tu pregunta. Puedo ayudarte con información sobre registro, oportunidades de voluntariado, requisitos, certificados y más. ¿Sobre qué te gustaría saber?',
        category: 'general'
    };
}

// Inicializar chatbot
function initChatbot() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotClose = document.getElementById('chatbot-close');
    
    let isOpen = false;
    
    // Mensaje de bienvenida
    function addWelcomeMessage() {
        const welcomeMsg = document.createElement('div');
        welcomeMsg.className = 'chatbot-message chatbot-bot';
        welcomeMsg.innerHTML = `
            <div class="message-content">
                <p>¡Hola! 👋 Soy el asistente virtual de INJUV. ¿En qué puedo ayudarte hoy?</p>
                <div class="quick-questions">
                    <button class="quick-question-btn" data-question="Quiero hacer un voluntariado pero no sé cómo empezar">¿Cómo empezar?</button>
                    <button class="quick-question-btn" data-question="No tengo experiencia previa, ¿puedo postular?">¿Puedo postular sin experiencia?</button>
                    <button class="quick-question-btn" data-question="¿Cuánto tengo que esperar para recibir una respuesta?">Tiempo de respuesta</button>
                    <button class="quick-question-btn" data-question="¿Dónde puedo aprender sobre voluntariado?">Aprender sobre voluntariado</button>
                    <button class="quick-question-btn" data-question="Tengo problemas con la plataforma">Problemas técnicos</button>
                    <button class="quick-question-btn" data-question="¿De qué me sirve realizar voluntariado?">Beneficios del voluntariado</button>
                </div>
            </div>
        `;
        chatbotMessages.appendChild(welcomeMsg);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Agregar mensaje al chat
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${isUser ? 'chatbot-user' : 'chatbot-bot'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = text;
        
        messageDiv.appendChild(messageContent);
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll automático
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        return messageDiv;
    }
    
    // Simular respuesta del bot con delay
    function botResponse(userMessage) {
        setTimeout(() => {
            const result = findBestResponse(userMessage);
            addMessage(result.response, false);
        }, 500);
    }
    
    // Enviar mensaje
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;
        
        addMessage(message, true);
        chatbotInput.value = '';
        botResponse(message);
    }
    
    // Toggle chatbot
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                chatbotContainer.classList.add('chatbot-open');
                if (chatbotMessages.children.length === 0) {
                    addWelcomeMessage();
                }
            } else {
                chatbotContainer.classList.remove('chatbot-open');
            }
        });
    }
    
    // Cerrar chatbot
    if (chatbotClose) {
        chatbotClose.addEventListener('click', () => {
            isOpen = false;
            chatbotContainer.classList.remove('chatbot-open');
        });
    }
    
    // Enviar con botón
    if (chatbotSend) {
        chatbotSend.addEventListener('click', sendMessage);
    }
    
    // Enviar con Enter
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Preguntas rápidas
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-question-btn')) {
            const question = e.target.getAttribute('data-question');
            chatbotInput.value = question;
            sendMessage();
        }
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    initChatbot();
}

