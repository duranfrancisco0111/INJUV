// Base de datos de preguntas frecuentes
const faqDatabase = {
    // Preguntas sobre registro
    registro: {
        keywords: ['registro', 'registrarse', 'crear cuenta', 'inscribirse', 'darse de alta'],
        responses: [
            'Para registrarte en la plataforma, puedes hacer clic en el botón "Iniciar Sesión" en la parte superior de la página y luego seleccionar "Crear cuenta". Necesitarás proporcionar tu información personal básica.',
            'El registro es completamente gratuito. Solo necesitas tener entre 18 y 29 años y ser chileno o residente en Chile.',
            'Puedes registrarte como usuario individual o como organización. Cada tipo de cuenta tiene diferentes funcionalidades.'
        ]
    },
    // Preguntas sobre voluntariado
    voluntariado: {
        keywords: ['voluntariado', 'oportunidades', 'proyectos', 'participar', 'ayudar'],
        responses: [
            'INJUV ofrece oportunidades de voluntariado en más de 140 comunas de Chile. Puedes buscar por región, temática o fecha en la sección de búsqueda principal.',
            'Las oportunidades de voluntariado incluyen áreas como educación, medio ambiente, salud, emergencias, cultura, deportes y desarrollo comunitario.',
            'Puedes postularte a múltiples oportunidades de voluntariado. Cada una tiene sus propios requisitos y fechas de inicio.',
            'Sí, recibirás un certificado oficial de INJUV que valida tu experiencia de voluntariado al completar un proyecto.'
        ]
    },
    // Preguntas sobre requisitos
    requisitos: {
        keywords: ['requisitos', 'edad', 'necesito', 'documentos', 'requiere'],
        responses: [
            'Para participar en programas de voluntariado de INJUV, necesitas tener entre 18 y 29 años.',
            'No se requieren documentos especiales para la mayoría de las oportunidades. Algunos proyectos específicos pueden tener requisitos adicionales que se indican en la descripción.',
            'No necesitas experiencia previa para la mayoría de las oportunidades. Lo importante es tu compromiso y ganas de ayudar.'
        ]
    },
    // Preguntas sobre certificados
    certificados: {
        keywords: ['certificado', 'certificación', 'documento', 'comprobante', 'validación'],
        responses: [
            'Sí, recibirás un certificado oficial de INJUV al completar exitosamente un proyecto de voluntariado.',
            'El certificado se emite automáticamente una vez que la organización anfitriona confirma tu participación y cumplimiento.',
            'Los certificados son digitales y se pueden descargar desde tu perfil de usuario.'
        ]
    },
    // Preguntas sobre organizaciones
    organizaciones: {
        keywords: ['organización', 'ong', 'fundación', 'registrar organización', 'ser anfitrión'],
        responses: [
            'Las organizaciones pueden registrarse en la plataforma para publicar oportunidades de voluntariado. Accede a la sección "Formulario de Organización" desde la página principal.',
            'Las organizaciones deben estar legalmente constituidas y cumplir con los requisitos establecidos por INJUV.',
            'Como organización, puedes gestionar tus oportunidades, revisar postulaciones y comunicarte con los voluntarios.'
        ]
    },
    // Preguntas sobre contacto
    contacto: {
        keywords: ['contacto', 'ayuda', 'soporte', 'pregunta', 'duda', 'información'],
        responses: [
            'Puedes encontrar información de contacto en el footer de la página. También puedes usar este chatbot para resolver dudas comunes.',
            'Para consultas específicas, puedes acceder a la sección "Contacto" en el menú del footer.',
            'El equipo de INJUV está disponible para ayudarte. Puedes contactarnos a través de nuestros canales oficiales.'
        ]
    },
    // Preguntas sobre búsqueda
    busqueda: {
        keywords: ['buscar', 'encontrar', 'filtrar', 'búsqueda', 'oportunidades disponibles'],
        responses: [
            'Puedes buscar oportunidades usando los filtros en la página principal: región, temática y rango de fechas.',
            'Hay más de 3,000 oportunidades disponibles en la plataforma. Usa los filtros para encontrar la que mejor se adapte a ti.',
            'Puedes ver todas las oportunidades disponibles haciendo clic en "Ver todas las oportunidades" en la sección de oportunidades destacadas.'
        ]
    },
    // Preguntas generales
    general: {
        keywords: ['qué es', 'qué ofrece', 'información', 'sobre injuv', 'plataforma'],
        responses: [
            'INJUV Connect es la plataforma oficial del Instituto Nacional de la Juventud que conecta a jóvenes chilenos con oportunidades de voluntariado.',
            'La plataforma ofrece más de 3,000 oportunidades de voluntariado en diversas áreas: educación, medio ambiente, salud, emergencias, cultura y más.',
            'Más de 12,000 jóvenes ya han participado en programas de voluntariado a través de INJUV Connect.',
            'INJUV es una institución gubernamental que promueve la participación y el desarrollo de los jóvenes chilenos.'
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
                    <button class="quick-question-btn" data-question="¿Cómo me registro?">¿Cómo me registro?</button>
                    <button class="quick-question-btn" data-question="¿Qué oportunidades de voluntariado hay?">¿Qué oportunidades hay?</button>
                    <button class="quick-question-btn" data-question="¿Cuáles son los requisitos?">¿Cuáles son los requisitos?</button>
                    <button class="quick-question-btn" data-question="¿Recibo un certificado?">¿Recibo un certificado?</button>
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

