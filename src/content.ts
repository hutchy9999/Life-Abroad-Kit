export type Phrase = {
  id: string;
  es: string;
  en: string;
  pattern: string;
  stage: number;
  prompt: string;
};
export type Scenario = {
  id: string;
  language: "es-ES";
  category: string;
  title: string;
  description: string;
  icon: string;
  stages: string[];
  phrases: Phrase[];
  dialogue: { speaker: string; es: string; en: string }[];
  reviewStatus: "draft";
};
type Row = [string, string, string, string?];
function scenario(
  id: string,
  category: string,
  title: string,
  description: string,
  icon: string,
  stages: string[],
  rows: Row[],
  dialogue: [string, string, string][],
): Scenario {
  return {
    id,
    language: "es-ES",
    category,
    title,
    description,
    icon,
    stages,
    reviewStatus: "draft",
    phrases: rows.map(([es, en, pattern, prompt], i) => ({
      id: `${id}-p${i + 1}`,
      es,
      en,
      pattern,
      prompt: prompt || `Say: “${en}”`,
      stage: Math.min(3, Math.floor(i / (rows.length / 4))),
    })),
    dialogue: dialogue.map(([speaker, es, en]) => ({ speaker, es, en })),
  };
}
export const scenarios: Scenario[] = [
  scenario(
    "flat",
    "Home & accommodation",
    "Viewing an apartment",
    "Find a place that feels like home. Ask the questions that matter.",
    "home",
    ["First impressions", "The details", "Costs & conditions", "Next steps"],
    [
      [
        "Vengo a ver el piso.",
        "I’m here to view the apartment.",
        "Vengo a… + what you’ve come to do.",
      ],
      [
        "¿Me lo puedes enseñar?",
        "Can you show it to me?",
        "¿Me puedes…? + the help you need.",
      ],
      [
        "¿Cuánta luz natural tiene?",
        "How much natural light does it get?",
        "¿Cuánta…? + what you want to ask about.",
      ],
      [
        "¿Está amueblado?",
        "Is it furnished?",
        "¿Está…? + the condition you need.",
      ],
      [
        "¿Los gastos están incluidos?",
        "Are bills included?",
        "¿Está incluido…? + a particular cost.",
      ],
      [
        "¿Cuánto se paga de fianza?",
        "How much is the deposit?",
        "¿Cuánto se paga de…? + a charge.",
      ],
      [
        "¿A partir de cuándo está disponible?",
        "When is it available from?",
        "¿A partir de cuándo…? + availability.",
      ],
      [
        "Me interesa. ¿Qué documentación necesitas?",
        "I’m interested. What documents do you need?",
        "Me interesa… + something you want to pursue.",
      ],
    ],
    [
      [
        "Agent",
        "¿Buscas algo para larga temporada?",
        "Are you looking for a long-term rental?",
      ],
      [
        "You",
        "Sí, me voy a quedar al menos un año.",
        "Yes, I’m going to stay at least a year.",
      ],
      ["Agent", "La fianza es de un mes.", "The deposit is one month’s rent."],
      ["You", "¿Los gastos están incluidos?", "Are bills included?"],
    ],
  ),
  scenario(
    "landlord",
    "Home & accommodation",
    "Talking to your landlord",
    "Resolve everyday questions about your home with confidence.",
    "key",
    [
      "Get in touch",
      "Explain the issue",
      "Find an agreement",
      "Confirm the plan",
    ],
    [
      [
        "Te escribo por el piso.",
        "I’m writing to you about the apartment.",
        "Te escribo por… + the reason for your message.",
      ],
      [
        "¿Te viene bien hablar ahora?",
        "Is now a good time to talk?",
        "¿Te viene bien…? + a time or activity.",
      ],
      [
        "Tengo una duda sobre el contrato.",
        "I have a question about the contract.",
        "Tengo una duda sobre… + a topic.",
      ],
      [
        "No me queda claro qué incluye el alquiler.",
        "I’m not clear on what the rent includes.",
        "No me queda claro… + what you need explained.",
      ],
      [
        "¿Podemos revisarlo juntos?",
        "Can we go over it together?",
        "¿Podemos…? + a shared next step.",
      ],
      [
        "Ya he hecho la transferencia.",
        "I’ve already made the bank transfer.",
        "Ya he… + something you’ve done.",
      ],
      [
        "¿Me lo puedes confirmar por escrito?",
        "Can you confirm it in writing?",
        "¿Me lo puedes confirmar…? + how you want confirmation.",
      ],
      [
        "Entonces quedamos así.",
        "So that’s agreed, then.",
        "Entonces… + a summary of the agreement.",
      ],
    ],
    [
      [
        "Landlord",
        "¿Has podido hacer el pago?",
        "Have you been able to make the payment?",
      ],
      [
        "You",
        "Sí, ya he hecho la transferencia.",
        "Yes, I’ve already made the transfer.",
      ],
      [
        "Landlord",
        "Perfecto, te aviso cuando llegue.",
        "Perfect, I’ll let you know when it arrives.",
      ],
      [
        "You",
        "Gracias. ¿Me lo puedes confirmar por escrito?",
        "Thanks. Can you confirm it in writing?",
      ],
    ],
  ),
  scenario(
    "repairs",
    "Home & accommodation",
    "Getting something fixed",
    "Explain what’s broken and arrange a visit.",
    "wrench",
    [
      "Make contact",
      "Describe the problem",
      "Arrange a visit",
      "Check the cost",
    ],
    [
      [
        "Llamo porque tengo un problema con el grifo.",
        "I’m calling because I have a problem with the tap.",
        "Tengo un problema con… + the item.",
      ],
      [
        "¿Hacéis reparaciones a domicilio?",
        "Do you do repairs at home?",
        "¿Hacéis…? + a service, when speaking to a business.",
      ],
      [
        "El agua sale muy fría.",
        "The water comes out very cold.",
        "El agua sale… + a description.",
      ],
      [
        "Lleva dos días goteando.",
        "It’s been dripping for two days.",
        "Lleva… + time + an ongoing action.",
      ],
      [
        "¿Cuándo podrías venir?",
        "When could you come?",
        "¿Cuándo podrías…? + a request.",
      ],
      [
        "Por la mañana estoy en casa.",
        "I’m at home in the morning.",
        "Por la mañana… + your availability.",
      ],
      [
        "¿Me puedes dar un presupuesto?",
        "Can you give me a quote?",
        "¿Me puedes dar…? + something you need.",
      ],
      [
        "Avísame antes de venir, por favor.",
        "Please let me know before you come.",
        "Avísame antes de… + an action.",
      ],
    ],
    [
      ["Plumber", "¿Desde cuándo pasa?", "How long has this been happening?"],
      ["You", "Lleva dos días goteando.", "It’s been dripping for two days."],
      [
        "Plumber",
        "Puedo pasar mañana de nueve a once.",
        "I can come tomorrow between nine and eleven.",
      ],
      [
        "You",
        "Perfecto. Avísame antes de venir, por favor.",
        "Perfect. Please let me know before you come.",
      ],
    ],
  ),
  scenario(
    "appointment",
    "Health & emergencies",
    "Booking a doctor’s appointment",
    "Make the call, find a time and know where to go.",
    "calendar",
    [
      "Ask for an appointment",
      "Explain what you need",
      "Find a time",
      "Confirm the details",
    ],
    [
      [
        "Quería pedir cita con el médico.",
        "I’d like to book a doctor’s appointment.",
        "Quería pedir cita con… + a professional.",
      ],
      [
        "¿Hay alguna cita disponible esta semana?",
        "Are there any appointments available this week?",
        "¿Hay alguna… disponible? + what you need.",
      ],
      [
        "No me encuentro bien.",
        "I’m not feeling well.",
        "Me encuentro… + how you feel.",
      ],
      [
        "Preferiría una cita presencial.",
        "I’d prefer an appointment in person.",
        "Preferiría… + your preference.",
      ],
      [
        "¿Tenéis algo por la tarde?",
        "Do you have anything in the afternoon?",
        "¿Tenéis algo…? + preferred availability.",
      ],
      [
        "A esa hora no puedo.",
        "I can’t make that time.",
        "A esa hora… + your availability.",
      ],
      [
        "¿Tengo que llevar la tarjeta sanitaria?",
        "Do I need to bring my health card?",
        "¿Tengo que llevar…? + an item.",
      ],
      [
        "Entonces, el martes a las diez.",
        "So, Tuesday at ten.",
        "Entonces… + repeat the date and time to confirm.",
      ],
    ],
    [
      [
        "Receptionist",
        "¿Es para medicina de familia?",
        "Is it for a GP appointment?",
      ],
      [
        "You",
        "Sí. ¿Tenéis algo por la tarde?",
        "Yes. Do you have anything in the afternoon?",
      ],
      ["Receptionist", "El jueves a las cinco.", "Thursday at five."],
      [
        "You",
        "Perfecto. ¿Tengo que llevar la tarjeta sanitaria?",
        "Perfect. Do I need to bring my health card?",
      ],
    ],
  ),
  scenario(
    "doctor",
    "Health & emergencies",
    "Describing your symptoms",
    "Explain what’s wrong and understand what happens next.",
    "heart",
    [
      "Explain why you’re here",
      "Describe your symptoms",
      "Answer questions",
      "Understand next steps",
    ],
    [
      [
        "Me duele la espalda desde hace tres días.",
        "My back has been hurting for three days.",
        "Me duele… + body part; desde hace… + duration.",
        "Tell the doctor your back has been hurting for three days.",
      ],
      [
        "Me duele más cuando me muevo.",
        "It hurts more when I move.",
        "Me duele más cuando… + an activity.",
      ],
      [
        "Tengo fiebre desde ayer.",
        "I’ve had a fever since yesterday.",
        "Tengo… + a symptom; desde… + starting point.",
      ],
      [
        "Me cuesta dormir por la noche.",
        "I find it hard to sleep at night.",
        "Me cuesta… + something you find difficult.",
      ],
      [
        "No soy alérgico a ningún medicamento.",
        "I’m not allergic to any medication.",
        "Soy alérgico/alérgica a… + a substance, if applicable.",
      ],
      [
        "Estoy tomando este medicamento.",
        "I’m taking this medication.",
        "Estoy tomando… + your medication.",
      ],
      [
        "¿Cada cuánto tengo que tomarlo?",
        "How often do I need to take it?",
        "¿Cada cuánto…? + frequency.",
      ],
      [
        "¿Me lo puedes repetir más despacio?",
        "Can you repeat that more slowly?",
        "¿Me lo puedes repetir…? + how you need it repeated.",
      ],
    ],
    [
      ["Doctor", "¿Dónde te duele exactamente?", "Where exactly does it hurt?"],
      [
        "You",
        "Me duele la espalda desde hace tres días.",
        "My back has been hurting for three days.",
      ],
      [
        "Doctor",
        "¿Has tomado algo para el dolor?",
        "Have you taken anything for the pain?",
      ],
      ["You", "No, todavía no.", "No, not yet."],
      ["Doctor", "¿Te duele al moverte?", "Does it hurt when you move?"],
      [
        "You",
        "Sí, me duele más cuando me muevo.",
        "Yes, it hurts more when I move.",
      ],
    ],
  ),
  scenario(
    "pharmacy",
    "Health & emergencies",
    "At the pharmacy",
    "Ask for help and understand how to use a medicine.",
    "cross",
    [
      "Ask for help",
      "Describe what you need",
      "Check the instructions",
      "Before you leave",
    ],
    [
      [
        "¿Tienes algo para el dolor de garganta?",
        "Do you have anything for a sore throat?",
        "¿Tienes algo para…? + a symptom.",
      ],
      [
        "Llevo dos días con tos.",
        "I’ve had a cough for two days.",
        "Llevo… + duration + con + symptom.",
      ],
      [
        "Tengo esta receta.",
        "I have this prescription.",
        "Tengo… + the document you’re showing.",
      ],
      [
        "¿Hace falta receta?",
        "Do I need a prescription?",
        "¿Hace falta…? + a requirement.",
      ],
      [
        "¿Cómo tengo que tomarlo?",
        "How should I take it?",
        "¿Cómo tengo que…? + an action.",
      ],
      [
        "¿Antes o después de comer?",
        "Before or after food?",
        "Antes/después de… + a reference activity.",
      ],
      [
        "¿Puede dar sueño?",
        "Can it make you drowsy?",
        "¿Puede dar…? + a possible effect.",
      ],
      [
        "¿Durante cuántos días?",
        "For how many days?",
        "¿Durante cuánto tiempo? also asks about duration.",
      ],
    ],
    [
      ["Pharmacist", "¿Tienes fiebre también?", "Do you have a fever too?"],
      [
        "You",
        "No, solo tos y dolor de garganta.",
        "No, just a cough and a sore throat.",
      ],
      [
        "Pharmacist",
        "¿Estás tomando algún medicamento?",
        "Are you taking any medication?",
      ],
      ["You", "Sí, estoy tomando este.", "Yes, I’m taking this one."],
    ],
  ),
  scenario(
    "returns",
    "Shopping & errands",
    "Returning an item",
    "Explain the problem and ask about your options.",
    "bag",
    [
      "Start the conversation",
      "Explain the problem",
      "Explore your options",
      "Finish the return",
    ],
    [
      [
        "Quería devolver esto.",
        "I’d like to return this.",
        "Quería… + what you’d like to do.",
      ],
      [
        "Lo compré aquí la semana pasada.",
        "I bought it here last week.",
        "Lo compré… + where or when.",
      ],
      [
        "No funciona bien.",
        "It doesn’t work properly.",
        "No funciona… + a description of the fault.",
      ],
      [
        "Me queda pequeño.",
        "It’s too small for me.",
        "Me queda… + pequeño/grande for size.",
      ],
      [
        "¿Puedo cambiarlo por otra talla?",
        "Can I exchange it for another size?",
        "¿Puedo cambiarlo por…? + an alternative.",
      ],
      [
        "Preferiría que me devolvierais el dinero.",
        "I’d prefer a refund.",
        "Preferiría… + your preferred solution.",
      ],
      [
        "Aquí tienes el ticket.",
        "Here’s the receipt.",
        "Aquí tienes… + what you’re handing over.",
      ],
      [
        "¿Cuánto tarda el reembolso?",
        "How long does the refund take?",
        "¿Cuánto tarda…? + a process.",
      ],
    ],
    [
      ["Assistant", "¿Tienes el ticket?", "Do you have the receipt?"],
      ["You", "Sí, aquí lo tienes.", "Yes, here it is."],
      [
        "Assistant",
        "¿Quieres cambiarlo por otro?",
        "Would you like to exchange it for another one?",
      ],
      [
        "You",
        "Preferiría que me devolvierais el dinero.",
        "I’d prefer a refund.",
      ],
    ],
  ),
  scenario(
    "haircut",
    "Shopping & errands",
    "Getting a haircut",
    "Explain the look you want and make small adjustments.",
    "scissors",
    ["Get a seat", "Describe the cut", "Make adjustments", "Finish up"],
    [
      [
        "¿Tenéis un hueco hoy?",
        "Do you have an opening today?",
        "¿Tenéis un hueco…? + when you’d like an appointment.",
      ],
      [
        "Quería cortarme el pelo.",
        "I’d like to get my hair cut.",
        "Quería… + the service you want.",
      ],
      [
        "Solo las puntas, por favor.",
        "Just the ends, please.",
        "Solo… + the part you want changed.",
      ],
      [
        "Me gustaría algo así.",
        "I’d like something like this.",
        "Me gustaría… + show a reference photo.",
      ],
      [
        "Un poco más corto por los lados.",
        "A little shorter on the sides.",
        "Un poco más… + an adjustment.",
      ],
      [
        "No demasiado corto, por favor.",
        "Not too short, please.",
        "No demasiado… + a limit.",
      ],
      [
        "Así está bien, gracias.",
        "That’s good like that, thanks.",
        "Así está bien… + confirmation.",
      ],
      [
        "¿Cuánto es?",
        "How much is it?",
        "¿Cuánto es? works when asking for the total.",
      ],
    ],
    [
      [
        "Hairdresser",
        "¿Cuánto quieres que te corte?",
        "How much do you want me to cut off?",
      ],
      ["You", "Solo las puntas, por favor.", "Just the ends, please."],
      ["Hairdresser", "¿Así está bien?", "Is it okay like this?"],
      ["You", "Un poquito más corto, por favor.", "A little shorter, please."],
    ],
  ),
  scenario(
    "neighbours",
    "Social life",
    "Meeting your neighbours",
    "Make a first connection and feel more at home.",
    "people",
    ["Say hello", "Introduce yourself", "Find common ground", "Keep in touch"],
    [
      [
        "Hola, soy tu nuevo vecino.",
        "Hi, I’m your new neighbour.",
        "Use vecina if that fits you.",
      ],
      [
        "Me acabo de mudar al tercero.",
        "I’ve just moved into the third floor.",
        "Me acabo de mudar a… + your new location.",
      ],
      [
        "Llevo poco tiempo aquí.",
        "I haven’t been here long.",
        "Llevo… + time + aquí.",
      ],
      [
        "Estoy aprendiendo español.",
        "I’m learning Spanish.",
        "Estoy aprendiendo… + a language or skill.",
      ],
      [
        "¿Llevas mucho tiempo en el barrio?",
        "Have you lived in the neighbourhood long?",
        "¿Llevas mucho tiempo…? + a place or activity.",
      ],
      [
        "¿Me recomiendas algún sitio para tomar café?",
        "Can you recommend somewhere for a coffee?",
        "¿Me recomiendas algún sitio para…? + an activity.",
      ],
      [
        "Si necesitas algo, estoy al lado.",
        "If you need anything, I’m next door.",
        "Si necesitas algo… + an offer of help.",
      ],
      [
        "Encantado de conocerte.",
        "Nice to meet you.",
        "Use encantada if that fits you.",
      ],
    ],
    [
      ["Neighbour", "¿Eres nuevo por aquí?", "Are you new around here?"],
      [
        "You",
        "Sí, me acabo de mudar al tercero.",
        "Yes, I’ve just moved into the third floor.",
      ],
      [
        "Neighbour",
        "¡Bienvenido! Soy Ana, vivo enfrente.",
        "Welcome! I’m Ana, I live opposite.",
      ],
      ["You", "Encantado de conocerte.", "Nice to meet you."],
    ],
  ),
  scenario(
    "plans",
    "Social life",
    "Making plans with friends",
    "Turn a friendly chat into a plan you can look forward to.",
    "coffee",
    [
      "Suggest a plan",
      "Find a time",
      "Make arrangements",
      "Change plans kindly",
    ],
    [
      [
        "¿Te apetece tomar algo?",
        "Do you fancy going for a drink?",
        "¿Te apetece…? + an activity.",
      ],
      [
        "¿Estás libre este fin de semana?",
        "Are you free this weekend?",
        "¿Estás libre…? + a time.",
      ],
      [
        "El sábado me viene bien.",
        "Saturday works for me.",
        "…me viene bien + a convenient time.",
      ],
      [
        "¿Quedamos sobre las siete?",
        "Shall we meet around seven?",
        "¿Quedamos sobre…? + an approximate time.",
      ],
      [
        "¿Dónde nos vemos?",
        "Where shall we meet?",
        "¿Dónde…? + a question about the location.",
      ],
      [
        "¿Te va bien en la plaza?",
        "Does the square work for you?",
        "¿Te va bien…? + a place or arrangement.",
      ],
      [
        "Al final no voy a poder. Lo siento.",
        "I won’t be able to make it after all. Sorry.",
        "Al final… + a change of plan.",
      ],
      [
        "¿Lo dejamos para otro día?",
        "Shall we leave it for another day?",
        "¿Lo dejamos para…? + a different time.",
      ],
    ],
    [
      [
        "Friend",
        "¿Te apetece tomar algo el viernes?",
        "Do you fancy going for a drink on Friday?",
      ],
      [
        "You",
        "El viernes no puedo. ¿Qué tal el sábado?",
        "I can’t on Friday. How about Saturday?",
      ],
      ["Friend", "¡Hecho! ¿Sobre las siete?", "Done! Around seven?"],
      ["You", "Perfecto. ¿Dónde nos vemos?", "Perfect. Where shall we meet?"],
    ],
  ),
  scenario(
    "transport",
    "Transport & navigation",
    "Getting around town",
    "Find your way, buy a ticket and check you’re going the right way.",
    "train",
    ["Find your way", "Buy a ticket", "Check the route", "Handle a delay"],
    [
      [
        "Perdona, ¿cómo se va a la estación?",
        "Excuse me, how do I get to the station?",
        "¿Cómo se va a…? + a destination.",
      ],
      [
        "¿Está muy lejos andando?",
        "Is it very far on foot?",
        "¿Está muy lejos…? + a way of travelling.",
      ],
      [
        "Un billete de ida y vuelta, por favor.",
        "A return ticket, please.",
        "Un billete de ida… for a single ticket.",
      ],
      [
        "¿Se puede pagar con tarjeta?",
        "Can I pay by card?",
        "¿Se puede…? + ask whether something is possible.",
      ],
      [
        "¿Este autobús pasa por el centro?",
        "Does this bus go through the centre?",
        "¿Este autobús pasa por…? + a place.",
      ],
      [
        "¿En qué parada tengo que bajarme?",
        "Which stop do I need to get off at?",
        "¿En qué…? + the stop or station.",
      ],
      [
        "¿Cuánto retraso lleva?",
        "How late is it running?",
        "¿Cuánto retraso lleva? for a delayed service.",
      ],
      [
        "¿Hay otra forma de llegar?",
        "Is there another way to get there?",
        "¿Hay otra forma de…? + an alternative action.",
      ],
    ],
    [
      ["Driver", "¿Adónde vas?", "Where are you going?"],
      [
        "You",
        "Al centro. ¿Este autobús pasa por allí?",
        "To the centre. Does this bus go there?",
      ],
      ["Driver", "Sí, te bajas en la plaza.", "Yes, get off at the square."],
      [
        "You",
        "Gracias. ¿Se puede pagar con tarjeta?",
        "Thanks. Can I pay by card?",
      ],
    ],
  ),
  scenario(
    "paperwork",
    "Work & administration",
    "Dealing with paperwork",
    "Ask what you need, clarify instructions and take the next step.",
    "file",
    [
      "Explain your visit",
      "Check requirements",
      "Ask for clarity",
      "Confirm next steps",
    ],
    [
      [
        "Tengo cita a las diez.",
        "I have an appointment at ten.",
        "Tengo cita a… + the time.",
      ],
      [
        "Vengo a hacer este trámite.",
        "I’m here to complete this procedure.",
        "Vengo a… + the task you’re here for.",
      ],
      [
        "¿Qué documentos necesito?",
        "What documents do I need?",
        "¿Qué… necesito? + requirements.",
      ],
      [
        "¿Hace falta una copia del pasaporte?",
        "Do I need a copy of my passport?",
        "¿Hace falta…? + a document or step.",
      ],
      [
        "¿Dónde tengo que firmar?",
        "Where do I need to sign?",
        "¿Dónde tengo que…? + an action.",
      ],
      [
        "No he entendido esta parte.",
        "I haven’t understood this part.",
        "No he entendido… + what needs explaining.",
      ],
      [
        "¿Se puede hacer por internet?",
        "Can it be done online?",
        "¿Se puede hacer…? + a method.",
      ],
      [
        "¿Cuál es el siguiente paso?",
        "What’s the next step?",
        "¿Cuál es…? + ask for the specific next action.",
      ],
    ],
    [
      [
        "Clerk",
        "¿Traes el original y una copia?",
        "Have you brought the original and a copy?",
      ],
      [
        "You",
        "Tengo el original. ¿Dónde puedo hacer una copia?",
        "I have the original. Where can I make a copy?",
      ],
      [
        "Clerk",
        "Hay una copistería enfrente.",
        "There’s a copy shop opposite.",
      ],
      [
        "You",
        "Gracias. ¿Puedo volver con la misma cita?",
        "Thanks. Can I come back with the same appointment?",
      ],
    ],
  ),
];
export const categories = [...new Set(scenarios.map((s) => s.category))];
