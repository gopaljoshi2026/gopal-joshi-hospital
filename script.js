/* =========================================================
   GOPAL JOSHI HOSPITAL - MAIN JAVASCRIPT
   Public Website Controller
   ========================================================= */

const API_BASE_URL = "/api";

/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showMessage(message, type = "info") {
    let box = $("globalMessage");

    if (!box) {
        box = document.createElement("div");
        box.id = "globalMessage";
        box.style.position = "fixed";
        box.style.right = "20px";
        box.style.bottom = "20px";
        box.style.zIndex = "99999";
        box.style.maxWidth = "360px";
        box.style.padding = "14px 18px";
        box.style.borderRadius = "12px";
        box.style.background = "#111827";
        box.style.color = "#fff";
        box.style.boxShadow = "0 10px 30px rgba(0,0,0,.2)";
        box.style.fontSize = "14px";
        document.body.appendChild(box);
    }

    box.textContent = message;

    if (type === "success") {
        box.style.background = "#15803d";
    } else if (type === "error") {
        box.style.background = "#dc2626";
    } else {
        box.style.background = "#111827";
    }

    clearTimeout(window.__messageTimer);

    window.__messageTimer = setTimeout(() => {
        box.remove();
    }, 3500);
}

/* =========================================================
   HOSPITAL DEPARTMENTS
   ========================================================= */

const departments = [
    {
        name: "Cardiology",
        icon: "❤️",
        description: "Heart and cardiovascular care."
    },
    {
        name: "Neurology",
        icon: "🧠",
        description: "Brain, nerve and neurological care."
    },
    {
        name: "Orthopedics",
        icon: "🦴",
        description: "Bone, joint and muscle care."
    },
    {
        name: "Pediatrics",
        icon: "👶",
        description: "Healthcare services for children."
    },
    {
        name: "Dermatology",
        icon: "🩺",
        description: "Skin, hair and nail care."
    },
    {
        name: "ENT",
        icon: "👂",
        description: "Ear, nose and throat care."
    },
    {
        name: "General Medicine",
        icon: "⚕️",
        description: "General diagnosis and medical care."
    },
    {
        name: "Gynecology",
        icon: "🏥",
        description: "Women's health services."
    },
    {
        name: "Ophthalmology",
        icon: "👁️",
        description: "Eye care and vision services."
    },
    {
        name: "Dental",
        icon: "🦷",
        description: "Dental and oral healthcare."
    }
];

/* =========================================================
   DEMO DOCTORS
   ========================================================= */

const doctors = [
    {
        id: 1,
        name: "Dr. Rajesh Sharma",
        specialty: "Cardiology",
        experience: "15+ Years",
        fee: 800,
        timing: "10:00 AM - 2:00 PM"
    },
    {
        id: 2,
        name: "Dr. Priya Verma",
        specialty: "Gynecology",
        experience: "12+ Years",
        fee: 700,
        timing: "11:00 AM - 3:00 PM"
    },
    {
        id: 3,
        name: "Dr. Amit Gupta",
        specialty: "General Medicine",
        experience: "10+ Years",
        fee: 500,
        timing: "9:00 AM - 1:00 PM"
    },
    {
        id: 4,
        name: "Dr. Neha Singh",
        specialty: "Pediatrics",
        experience: "9+ Years",
        fee: 600,
        timing: "4:00 PM - 8:00 PM"
    },
    {
        id: 5,
        name: "Dr. Arjun Mehta",
        specialty: "Orthopedics",
        experience: "14+ Years",
        fee: 750,
        timing: "10:00 AM - 1:00 PM"
    },
    {
        id: 6,
        name: "Dr. Kavita Joshi",
        specialty: "Dermatology",
        experience: "11+ Years",
        fee: 650,
        timing: "2:00 PM - 6:00 PM"
    },
    {
        id: 7,
        name: "Dr. Rohit Agarwal",
        specialty: "Neurology",
        experience: "16+ Years",
        fee: 1000,
        timing: "5:00 PM - 8:00 PM"
    },
    {
        id: 8,
        name: "Dr. Anjali Kapoor",
        specialty: "Ophthalmology",
        experience: "8+ Years",
        fee: 600,
        timing: "10:00 AM - 2:00 PM"
    }
];

/* =========================================================
   MEDICINE DATABASE
   ========================================================= */

const medicines = [
    {
        name: "Paracetamol",
        generic: "Paracetamol",
        category: "Pain Relief / Fever",
        keywords: "fever pain headache body ache temperature",
        use: "Commonly used for temporary relief of mild to moderate pain and fever.",
        note: "Use only according to professional advice or the product instructions."
    },
    {
        name: "Ibuprofen",
        generic: "Ibuprofen",
        category: "Pain Relief / Anti-inflammatory",
        keywords: "pain fever inflammation headache muscle joint",
        use: "Commonly used for pain, fever and inflammation.",
        note: "May not be suitable for everyone. Ask a healthcare professional if unsure."
    },
    {
        name: "Cetirizine",
        generic: "Cetirizine",
        category: "Antihistamine",
        keywords: "allergy allergic sneezing itching runny nose",
        use: "Commonly used to relieve symptoms of allergies such as sneezing and itching.",
        note: "May cause drowsiness in some people."
    },
    {
        name: "Loratadine",
        generic: "Loratadine",
        category: "Antihistamine",
        keywords: "allergy sneezing itching runny nose",
        use: "Used for common allergy symptoms.",
        note: "Follow the label or professional advice."
    },
    {
        name: "Amoxicillin",
        generic: "Amoxicillin",
        category: "Antibiotic",
        keywords: "bacterial infection antibiotic throat ear chest",
        use: "An antibiotic used for certain bacterial infections.",
        note: "Antibiotics should be used only when prescribed by a qualified healthcare professional."
    },
    {
        name: "Azithromycin",
        generic: "Azithromycin",
        category: "Antibiotic",
        keywords: "bacterial infection antibiotic respiratory throat",
        use: "An antibiotic used for certain bacterial infections.",
        note: "Use only when prescribed."
    },
    {
        name: "Omeprazole",
        generic: "Omeprazole",
        category: "Acid Reduction",
        keywords: "acidity acid reflux heartburn stomach",
        use: "Used to reduce stomach acid and help manage conditions such as acid reflux.",
        note: "Persistent symptoms should be discussed with a healthcare professional."
    },
    {
        name: "Pantoprazole",
        generic: "Pantoprazole",
        category: "Acid Reduction",
        keywords: "acidity heartburn reflux stomach acid",
        use: "Reduces stomach acid and is commonly used for acid-related conditions.",
        note: "Use according to professional guidance."
    },
    {
        name: "ORS",
        generic: "Oral Rehydration Salts",
        category: "Rehydration",
        keywords: "dehydration diarrhea loose motion vomiting water salts",
        use: "Helps replace fluids and electrolytes lost during dehydration.",
        note: "Severe dehydration requires medical attention."
    },
    {
        name: "Calcium Carbonate",
        generic: "Calcium Carbonate",
        category: "Mineral Supplement",
        keywords: "calcium bones mineral supplement",
        use: "A calcium-containing product used in specific nutritional or medical situations.",
        note: "Use supplements based on professional advice when needed."
    },
    {
        name: "Vitamin D3",
        generic: "Cholecalciferol",
        category: "Vitamin Supplement",
        keywords: "vitamin d bones deficiency supplement",
        use: "Used to prevent or treat vitamin D deficiency.",
        note: "Appropriate use depends on individual needs."
    },
    {
        name: "Metformin",
        generic: "Metformin",
        category: "Diabetes Medicine",
        keywords: "diabetes blood sugar glucose type 2",
        use: "Commonly used in the management of type 2 diabetes.",
        note: "Requires professional medical guidance."
    },
    {
        name: "Amlodipine",
        generic: "Amlodipine",
        category: "Blood Pressure",
        keywords: "blood pressure hypertension heart",
        use: "Commonly used to manage high blood pressure.",
        note: "Do not change treatment without medical advice."
    },
    {
        name: "Losartan",
        generic: "Losartan",
        category: "Blood Pressure",
        keywords: "blood pressure hypertension heart",
        use: "Used for high blood pressure and certain cardiovascular conditions.",
        note: "Requires professional guidance."
    },
    {
        name: "Atorvastatin",
        generic: "Atorvastatin",
        category: "Cholesterol",
        keywords: "cholesterol lipid heart cardiovascular",
        use: "Used to help manage cholesterol levels.",
        note: "Use only under professional guidance."
    },
    {
        name: "Levothyroxine",
        generic: "Levothyroxine",
        category: "Thyroid",
        keywords: "thyroid hypothyroidism hormone",
        use: "Used as thyroid hormone replacement in hypothyroidism.",
        note: "Treatment requires medical supervision."
    },
    {
        name: "Salbutamol",
        generic: "Salbutamol",
        category: "Respiratory",
        keywords: "asthma breathing wheezing airway",
        use: "Used to relieve certain breathing symptoms caused by narrowed airways.",
        note: "People with breathing problems should follow their clinician's treatment plan."
    },
    {
        name: "Montelukast",
        generic: "Montelukast",
        category: "Respiratory / Allergy",
        keywords: "asthma allergy breathing allergic rhinitis",
        use: "Used in certain asthma and allergy treatment plans.",
        note: "Use under medical guidance."
    },
    {
        name: "Diclofenac",
        generic: "Diclofenac",
        category: "Pain Relief / Anti-inflammatory",
        keywords: "pain inflammation joint muscle arthritis",
        use: "Used for pain and inflammation in certain conditions.",
        note: "Not suitable for everyone; professional advice is important."
    },
    {
        name: "Domperidone",
        generic: "Domperidone",
        category: "Digestive",
        keywords: "nausea vomiting stomach digestion",
        use: "May be used for certain nausea and vomiting conditions.",
        note: "Use only under appropriate medical advice."
    },
    {
        name: "Ondansetron",
        generic: "Ondansetron",
        category: "Anti-nausea",
        keywords: "nausea vomiting sickness",
        use: "Used to help prevent nausea and vomiting in certain situations.",
        note: "Medical guidance is recommended."
    },
    {
        name: "Doxycycline",
        generic: "Doxycycline",
        category: "Antibiotic",
        keywords: "bacterial infection antibiotic skin respiratory",
        use: "An antibiotic used for certain bacterial infections.",
        note: "Prescription use only."
    },
    {
        name: "Cefixime",
        generic: "Cefixime",
        category: "Antibiotic",
        keywords: "bacterial infection antibiotic respiratory urinary",
        use: "Used for certain bacterial infections.",
        note: "Use only when prescribed."
    },
    {
        name: "Cefuroxime",
        generic: "Cefuroxime",
        category: "Antibiotic",
        keywords: "bacterial infection antibiotic respiratory ear",
        use: "An antibiotic used for certain bacterial infections.",
        note: "Prescription use only."
    },
    {
        name: "Clindamycin",
        generic: "Clindamycin",
        category: "Antibiotic",
        keywords: "bacterial infection antibiotic skin dental",
        use: "Used for certain bacterial infections.",
        note: "Use only under professional supervision."
    },
    {
        name: "Mupirocin",
        generic: "Mupirocin",
        category: "Topical Antibiotic",
        keywords: "skin bacterial infection topical cream",
        use: "A topical antibiotic used for certain bacterial skin infections.",
        note: "Use according to professional advice."
    },
    {
        name: "Hydrocortisone",
        generic: "Hydrocortisone",
        category: "Topical Steroid",
        keywords: "skin itching inflammation rash cream",
        use: "Can reduce inflammation and itching in certain skin conditions.",
        note: "Long or inappropriate use of steroid creams can cause problems; seek professional advice."
    },
    {
        name: "Calamine Lotion",
        generic: "Calamine",
        category: "Skin Care",
        keywords: "itching rash skin irritation lotion",
        use: "Provides soothing relief for certain minor skin irritation and itching.",
        note: "For persistent or severe skin problems, consult a clinician."
    },
    {
        name: "Clotrimazole",
        generic: "Clotrimazole",
        category: "Antifungal",
        keywords: "fungal infection skin itching ringworm",
        use: "Used for certain fungal skin infections.",
        note: "Correct diagnosis is important."
    },
    {
        name: "Fluconazole",
        generic: "Fluconazole",
        category: "Antifungal",
        keywords: "fungal infection yeast infection",
        use: "An antifungal medicine used for certain fungal infections.",
        note: "Prescription guidance may be required."
    },
    {
        name: "Acyclovir",
        generic: "Acyclovir",
        category: "Antiviral",
        keywords: "viral infection herpes antiviral",
        use: "Used for certain herpes-family viral infections.",
        note: "Use under professional guidance."
    },
    {
        name: "Oseltamivir",
        generic: "Oseltamivir",
        category: "Antiviral",
        keywords: "influenza flu antiviral",
        use: "Used in certain influenza treatment and prevention situations.",
        note: "Requires appropriate medical guidance."
    },
    {
        name: "Budesonide",
        generic: "Budesonide",
        category: "Respiratory",
        keywords: "asthma airway inflammation inhaler",
        use: "An anti-inflammatory medicine used in certain respiratory conditions.",
        note: "Use according to the prescribed treatment plan."
    },
    {
        name: "Fluticasone",
        generic: "Fluticasone",
        category: "Respiratory / Allergy",
        keywords: "allergy nasal congestion inflammation asthma",
        use: "Used in certain allergy and respiratory treatment plans.",
        note: "Follow professional instructions."
    },
    {
        name: "Prednisolone",
        generic: "Prednisolone",
        category: "Corticosteroid",
        keywords: "inflammation allergy immune condition steroid",
        use: "A corticosteroid used for selected inflammatory and immune-related conditions.",
        note: "Should be used only under medical supervision."
    },
    {
        name: "Furosemide",
        generic: "Furosemide",
        category: "Diuretic",
        keywords: "fluid retention swelling heart kidney",
        use: "A diuretic used in certain conditions involving excess fluid.",
        note: "Requires medical supervision."
    },
    {
        name: "Aspirin",
        generic: "Acetylsalicylic Acid",
        category: "Pain / Cardiovascular",
        keywords: "pain fever platelet cardiovascular",
        use: "Used for selected pain or cardiovascular indications.",
        note: "Not appropriate for everyone, especially children; use only with suitable professional advice."
    },
    {
        name: "Clopidogrel",
        generic: "Clopidogrel",
        category: "Antiplatelet",
        keywords: "platelet blood clot cardiovascular heart stroke",
        use: "Used to reduce certain blood-clotting risks in cardiovascular conditions.",
        note: "Prescription medicine; do not stop without medical advice."
    },
    {
        name: "Warfarin",
        generic: "Warfarin",
        category: "Anticoagulant",
        keywords: "blood clot anticoagulant cardiovascular",
        use: "An anticoagulant used for certain clotting conditions.",
        note: "Requires close medical monitoring."
    },
    {
        name: "Enoxaparin",
        generic: "Enoxaparin",
        category: "Anticoagulant",
        keywords: "blood clot anticoagulant hospital",
        use: "Used in selected situations to prevent or treat blood clots.",
        note: "Prescription and medical monitoring required."
    },
    {
        name: "Insulin",
        generic: "Insulin",
        category: "Diabetes",
        keywords: "diabetes blood glucose sugar hormone",
        use: "Used to control blood glucose in people who need insulin therapy.",
        note: "Requires individualized medical supervision."
    },
    {
        name: "Glimepiride",
        generic: "Glimepiride",
        category: "Diabetes",
        keywords: "diabetes blood sugar glucose type 2",
        use: "Used in some type 2 diabetes treatment plans.",
        note: "Requires professional guidance."
    },
    {
        name: "Sitagliptin",
        generic: "Sitagliptin",
        category: "Diabetes",
        keywords: "diabetes blood sugar glucose type 2",
        use: "Used in some type 2 diabetes treatment plans.",
        note: "Prescription use."
    },
    {
        name: "Empagliflozin",
        generic: "Empagliflozin",
        category: "Diabetes / Cardiovascular",
        keywords: "diabetes glucose heart kidney type 2",
        use: "Used in selected type 2 diabetes and cardiovascular/kidney treatment plans.",
        note: "Requires medical supervision."
    },
    {
        name: "Tamsulosin",
        generic: "Tamsulosin",
        category: "Urology",
        keywords: "urinary prostate enlarged prostate urine",
        use: "Used for urinary symptoms associated with an enlarged prostate.",
        note: "Medical advice is recommended."
    },
    {
        name: "Finasteride",
        generic: "Finasteride",
        category: "Urology / Hair",
        keywords: "prostate hair loss androgen",
        use: "Used for selected prostate or hair-loss conditions.",
        note: "Requires professional guidance."
    },
    {
        name: "Gabapentin",
        generic: "Gabapentin",
        category: "Neurology",
        keywords: "nerve pain neuropathy seizure",
        use: "Used for certain nerve-pain and seizure-related conditions.",
        note: "Prescription medicine."
    },
    {
        name: "Pregabalin",
        generic: "Pregabalin",
        category: "Neurology",
        keywords: "nerve pain neuropathy seizure",
        use: "Used for certain nerve-pain and neurological conditions.",
        note: "Prescription medicine."
    },
    {
        name: "Carbamazepine",
        generic: "Carbamazepine",
        category: "Neurology",
        keywords: "seizure epilepsy nerve pain",
        use: "Used for selected seizure and neurological conditions.",
        note: "Requires medical monitoring."
    },
    {
        name: "Sertraline",
        generic: "Sertraline",
        category: "Mental Health",
        keywords: "depression anxiety mental health",
        use: "Used in certain depression and anxiety treatment plans.",
        note: "Prescription medicine; treatment should be supervised by a clinician."
    },
    {
        name: "Escitalopram",
        generic: "Escitalopram",
        category: "Mental Health",
        keywords: "depression anxiety mental health",
        use: "Used in certain depression and anxiety treatment plans.",
        note: "Prescription medicine."
    },
    {
        name: "Alprazolam",
        generic: "Alprazolam",
        category: "Mental Health",
        keywords: "anxiety panic",
        use: "Used for certain anxiety-related conditions.",
        note: "Prescription medicine with important safety considerations."
    },
    {
        name: "Diazepam",
        generic: "Diazepam",
        category: "Neurology / Mental Health",
        keywords: "anxiety muscle spasm seizure",
        use: "Used for selected medical conditions including certain muscle spasms or seizure situations.",
        note: "Prescription medicine."
    },
    {
        name: "Loperamide",
        generic: "Loperamide",
        category: "Digestive",
        keywords: "diarrhea loose motion bowel",
        use: "Can help reduce diarrhea in selected situations.",
        note: "Some forms of diarrhea need medical evaluation."
    },
    {
        name: "Lactulose",
        generic: "Lactulose",
        category: "Digestive",
        keywords: "constipation bowel stool laxative",
        use: "Used for constipation and certain medical indications.",
        note: "Follow professional guidance."
    },
    {
        name: "Bisacodyl",
        generic: "Bisacodyl",
        category: "Laxative",
        keywords: "constipation bowel stool",
        use: "Used for short-term relief of constipation.",
        note: "Persistent constipation should be medically assessed."
    },
    {
        name: "Dicyclomine",
        generic: "Dicyclomine",
        category: "Digestive",
        keywords: "abdominal cramps stomach pain bowel",
        use: "Used for certain abdominal cramping conditions.",
        note: "Use according to professional advice."
    },
    {
        name: "Sucralfate",
        generic: "Sucralfate",
        category: "Digestive",
        keywords: "ulcer stomach gastric acid",
        use: "Used in certain ulcer-related treatment plans.",
        note: "Use under professional guidance."
    },
    {
        name: "Simethicone",
        generic: "Simethicone",
        category: "Digestive",
        keywords: "gas bloating stomach",
        use: "Used to relieve symptoms related to gas and bloating.",
        note: "Persistent abdominal symptoms need evaluation."
    },
    {
        name: "Ferrous Sulfate",
        generic: "Ferrous Sulfate",
        category: "Iron Supplement",
        keywords: "iron anemia hemoglobin deficiency",
        use: "Used to prevent or treat iron deficiency in appropriate cases.",
        note: "Iron supplements should be used when appropriate."
    },
    {
        name: "Folic Acid",
        generic: "Folic Acid",
        category: "Vitamin",
        keywords: "folate vitamin pregnancy anemia deficiency",
        use: "Used to prevent or treat folate deficiency and in selected pregnancy care.",
        note: "Use according to professional guidance."
    },
    {
        name: "Vitamin B12",
        generic: "Cobalamin",
        category: "Vitamin",
        keywords: "vitamin b12 anemia nerve deficiency",
        use: "Used to prevent or treat vitamin B12 deficiency.",
        note: "The cause of deficiency should be evaluated."
    },
    {
        name: "Multivitamin",
        generic: "Multivitamin",
        category: "Supplement",
        keywords: "vitamins minerals nutrition supplement",
        use: "Provides a combination of vitamins and minerals.",
        note: "Supplements are not substitutes for a balanced diet."
    }
];

/* =========================================================
   FUZZY SEARCH
   ========================================================= */

function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function levenshtein(a, b) {
    a = normalizeText(a);
    b = normalizeText(b);

    if (!a) return b.length;
    if (!b) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function wordSimilarity(a, b) {
    a = normalizeText(a);
    b = normalizeText(b);

    if (!a || !b) return 0;
    if (a === b) return 1;

    if (a.includes(b) || b.includes(a)) {
        return 0.92;
    }

    const distance = levenshtein(a, b);
    return Math.max(0, 1 - distance / Math.max(a.length, b.length));
}

function medicineScore(query, medicine) {
    const q = normalizeText(query);

    if (!q) return 0;

    const queryWords = q.split(" ").filter(word => word.length >= 2);

    const fields = [
        normalizeText(medicine.name),
        normalizeText(medicine.generic),
        normalizeText(medicine.category),
        normalizeText(medicine.keywords),
        normalizeText(medicine.use)
    ];

    let score = 0;
    let matchedWords = 0;

    for (const word of queryWords) {
        let best = 0;

        for (const field of fields) {
            const fieldWords = field.split(" ");

            for (const fw of fieldWords) {
                best = Math.max(best, wordSimilarity(word, fw));
            }

            if (field.includes(word)) {
                best = Math.max(best, 0.95);
            }
        }

        if (best >= 0.55) {
            matchedWords++;
            score += best;
        }
    }

    if (!queryWords.length) return 0;

    let finalScore = score / queryWords.length;

    // Strong boost when multiple meaningful words match.
    if (matchedWords >= 2) finalScore += 0.08;
    if (matchedWords >= 4) finalScore += 0.08;
    if (matchedWords >= 6) finalScore += 0.05;

    return Math.min(finalScore, 1);
}

function searchMedicines(query) {
    const q = normalizeText(query);

    if (!q) return [];

    return medicines
        .map(medicine => ({
            medicine,
            score: medicineScore(q, medicine)
        }))
        .filter(item => item.score >= 0.52)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
}

/* =========================================================
   MEDICINE SEARCH UI
   ========================================================= */

function setupMedicineSearch() {
    const input =
        $("medicineSearch") ||
        $("medicine-search") ||
        document.querySelector("[data-medicine-search]");

    const result =
        $("medicineResults") ||
        $("medicine-results") ||
        document.querySelector("[data-medicine-results]");

    if (!input || !result) return;

    function renderMedicineResults() {
        const query = input.value.trim();

        if (!query) {
            result.innerHTML = `
                <div class="empty-state">
                    Enter medicine name, generic name, category or common-use keywords.
                </div>
            `;
            return;
        }

        const results = searchMedicines(query);

        if (!results.length) {
            result.innerHTML = `
                <div class="empty-state">
                    Medicine not found. Try the medicine name, generic name,
                    category or common-use words.
                </div>
            `;
            return;
        }

        result.innerHTML = results.map(item => {
            const m = item.medicine;

            return `
                <div class="medicine-card">
                    <h3>${escapeHTML(m.name)}</h3>

                    <p>
                        <strong>Generic:</strong>
                        ${escapeHTML(m.generic)}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${escapeHTML(m.category)}
                    </p>

                    <p>
                        <strong>Common use:</strong>
                        ${escapeHTML(m.use)}
                    </p>

                    <p class="medicine-note">
                        <strong>Important:</strong>
                        ${escapeHTML(m.note)}
                    </p>
                </div>
            `;
        }).join("");
    }

    input.addEventListener("input", renderMedicineResults);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            renderMedicineResults();
        }
    });
}

/* =========================================================
   DOCTOR SEARCH
   ========================================================= */

function doctorMatches(query, doctor) {
    const q = normalizeText(query);

    if (!q) return true;

    const text = normalizeText(
        `${doctor.name} ${doctor.specialty} ${doctor.experience}`
    );

    const words = q.split(" ").filter(Boolean);

    return words.every(word => {
        if (text.includes(word)) return true;

        return text
            .split(" ")
            .some(part => wordSimilarity(word, part) >= 0.65);
    });
}

function setupDoctorSearch() {
    const input =
        $("doctorSearch") ||
        $("doctor-search") ||
        document.querySelector("[data-doctor-search]");

    if (!input) return;

    input.addEventListener("input", () => {
        renderDoctors(input.value);
    });

    renderDoctors("");
}

function renderDoctors(query = "") {
    const container =
        $("doctorList") ||
        $("doctorsList") ||
        $("doctorGrid") ||
        document.querySelector("[data-doctor-list]");

    if (!container) return;

    const filtered = doctors.filter(doctor =>
        doctorMatches(query, doctor)
    );

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-state">
                No doctor found. Try another name or specialty.
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(doctor => `
        <div class="doctor-card">
            <div class="doctor-icon">👨‍⚕️</div>

            <h3>${escapeHTML(doctor.name)}</h3>

            <p>
                <strong>${escapeHTML(doctor.specialty)}</strong>
            </p>

            <p>${escapeHTML(doctor.experience)}</p>

            <p>
                Consultation Fee:
                <strong>Rs. ${doctor.fee}</strong>
            </p>

            <p>
                Timing:
                ${escapeHTML(doctor.timing)}
            </p>

            <button
                type="button"
                class="btn"
                onclick="selectDoctor(${doctor.id})">
                Book Appointment
            </button>
        </div>
    `).join("");
}

function selectDoctor(id) {
    const doctor = doctors.find(d => d.id === Number(id));

    if (!doctor) return;

    const doctorSelect =
        $("doctor") ||
        $("doctorSelect") ||
        $("appointmentDoctor");

    if (doctorSelect) {
        const option = [...doctorSelect.options].find(
            option =>
                option.value === doctor.name ||
                option.textContent.includes(doctor.name)
        );

        if (option) {
            doctorSelect.value = option.value;
        } else {
            doctorSelect.value = doctor.name;
        }
    }

    const feeField =
        $("doctorFee") ||
        $("appointmentFee");

    if (feeField) {
        feeField.value = doctor.fee;
    }

    const appointmentSection =
        $("appointment") ||
        document.querySelector("#appointment");

    if (appointmentSection) {
        appointmentSection.scrollIntoView({
            behavior: "smooth"
        });
    }

    showMessage(`${doctor.name} selected for appointment`, "success");
}

/* =========================================================
   APPOINTMENT
   ========================================================= */

function getAppointmentForm() {
    return (
        $("appointmentForm") ||
        $("appointment-form") ||
        document.querySelector("[data-appointment-form]")
    );
}

function collectAppointmentData(form) {
    const formData = new FormData(form);

    return {
        patientName:
            formData.get("patientName") ||
            formData.get("name") ||
            $("patientName")?.value ||
            $("patient-name")?.value ||
            "",

        email:
            formData.get("email") ||
            $("patientEmail")?.value ||
            $("email")?.value ||
            "",

        phone:
            formData.get("phone") ||
            $("patientPhone")?.value ||
            $("phone")?.value ||
            "",

        doctor:
            formData.get("doctor") ||
            $("doctor")?.value ||
            $("doctorSelect")?.value ||
            "",

        date:
            formData.get("date") ||
            $("appointmentDate")?.value ||
            $("date")?.value ||
            "",

        time:
            formData.get("time") ||
            $("appointmentTime")?.value ||
            $("time")?.value ||
            "",

        reason:
            formData.get("reason") ||
            $("reason")?.value ||
            $("appointmentReason")?.value ||
            ""
    };
}

function saveLocalAppointment(appointment) {
    const key = "gjh_appointments";

    const list = JSON.parse(
        localStorage.getItem(key) || "[]"
    );

    list.push(appointment);

    localStorage.setItem(
        key,
        JSON.stringify(list)
    );
}

function showAppointmentConfirmation(appointment) {
    const box =
        $("appointmentConfirmation") ||
        $("confirmation") ||
        $("bookingConfirmation");

    if (!box) {
        showMessage(
            `Appointment booked successfully for ${appointment.patientName}`,
            "success"
        );
        return;
    }

    box.style.display = "block";

    box.innerHTML = `
        <div class="confirmation-box">
            <h3>Appointment Booked Successfully</h3>

            <p>
                <strong>Patient:</strong>
                ${escapeHTML(appointment.patientName)}
            </p>

            <p>
                <strong>Doctor:</strong>
                ${escapeHTML(appointment.doctor)}
            </p>

            <p>
                <strong>Date:</strong>
                ${escapeHTML(appointment.date)}
            </p>

            <p>
                <strong>Time:</strong>
                ${escapeHTML(appointment.time)}
            </p>

            <p>
                <strong>Status:</strong>
                Booked
            </p>

            <p>
                Please keep your appointment details for hospital check-in.
            </p>
        </div>
    `;

    box.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

async function submitAppointment(appointment) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/appointments`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...appointment,
                    doctorName: appointment.doctor
                })
            }
        );

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message || "Appointment failed"
            );
        }

        return data.appointment;
    } catch (error) {
        console.warn(
            "Backend not available. Saving appointment locally."
        );

        return {
            ...appointment,
            id: Date.now(),
            status: "Booked",
            createdAt: new Date().toISOString()
        };
    }
}

function setupAppointmentForm() {
    const form = getAppointmentForm();

    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const appointment =
            collectAppointmentData(form);

        if (
            !appointment.patientName ||
            !appointment.email ||
            !appointment.phone ||
            !appointment.doctor ||
            !appointment.date ||
            !appointment.time ||
            !appointment.reason
        ) {
            showMessage(
                "Please fill all appointment details.",
                "error"
            );
            return;
        }

        const today =
            new Date().toISOString().split("T")[0];

        if (appointment.date < today) {
            showMessage(
                "Please select today or a future date.",
                "error"
            );
            return;
        }

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent =
                "Booking...";
        }

        const saved =
            await submitAppointment(appointment);

        saveLocalAppointment(saved);

        showAppointmentConfirmation(saved);

        showMessage(
            "Appointment booked successfully!",
            "success"
        );

        form.reset();

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent =
                "Book Appointment";
        }
    });
}

/* =========================================================
   PATIENT PANEL LINK
   ========================================================= */

function setupPatientLinks() {
    const links = document.querySelectorAll(
        '[data-patient-panel], .patient-panel-link'
    );

    links.forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();

            window.location.href =
                "patient/index.html";
        });
    });
}

/* =========================================================
   DEPARTMENT CARDS
   ========================================================= */

function setupDepartments() {
    const container =
        $("departmentList") ||
        $("departmentsList") ||
        $("departmentGrid") ||
        document.querySelector("[data-department-list]");

    if (!container) return;

    if (container.children.length > 0) {
        return;
    }

    container.innerHTML = departments.map(department => `
        <div class="department-card">
            <div class="department-icon">
                ${department.icon}
            </div>

            <h3>${escapeHTML(department.name)}</h3>

            <p>
                ${escapeHTML(department.description)}
            </p>
        </div>
    `).join("");
}

/* =========================================================
   DATE MINIMUM
   ========================================================= */

function setupDateInputs() {
    const today =
        new Date().toISOString().split("T")[0];

    document
        .querySelectorAll('input[type="date"]')
        .forEach(input => {
            if (!input.min) {
                input.min = today;
            }
        });
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function setupSmoothNavigation() {
    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {
            link.addEventListener("click", event => {
                const targetId =
                    link.getAttribute("href");

                if (!targetId || targetId === "#") {
                    return;
                }

                const target =
                    document.querySelector(targetId);

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            });
        });
}

/* =========================================================
   REGISTER DEMO
   ========================================================= */

function setupRegistration() {
    const form =
        $("registerForm") ||
        $("registrationForm");

    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const formData =
            new FormData(form);

        const user = {
            name:
                formData.get("name") ||
                $("registerName")?.value ||
                "",

            email:
                formData.get("email") ||
                $("registerEmail")?.value ||
                "",

            phone:
                formData.get("phone") ||
                $("registerPhone")?.value ||
                "",

            createdAt:
                new Date().toISOString()
        };

        if (!user.name || !user.email) {
            showMessage(
                "Please enter name and email.",
                "error"
            );
            return;
        }

        localStorage.setItem(
            "gjh_demo_patient",
            JSON.stringify(user)
        );

        showMessage(
            "Registration successful!",
            "success"
        );

        form.reset();
    });
}

/* =========================================================
   LOGIN DEMO
   ========================================================= */

function setupLogin() {
    const form =
        $("loginForm") ||
        $("patientLoginForm");

    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const formData =
            new FormData(form);

        const email =
            formData.get("email") ||
            $("loginEmail")?.value ||
            "";

        if (!email) {
            showMessage(
                "Please enter your email.",
                "error"
            );
            return;
        }

        const patient =
            JSON.parse(
                localStorage.getItem(
                    "gjh_demo_patient"
                ) || "null"
            );

        if (
            patient &&
            patient.email === email
        ) {
            localStorage.setItem(
                "gjh_patient_logged_in",
                "true"
            );

            showMessage(
                "Login successful!",
                "success"
            );

            setTimeout(() => {
                window.location.href =
                    "patient/index.html";
            }, 700);
        } else {
            showMessage(
                "Patient account not found. Please register first.",
                "error"
            );
        }
    });
}

/* =========================================================
   GLOBAL BUTTON HELP
   ========================================================= */

function setupPanelNavigation() {
    const panelMap = {
        patient: "patient/index.html",
        doctor: "doctor/index.html",
        pharmacy: "pharmacy/index.html",
        laboratory: "laboratory/index.html",
        nurse: "nurse/index.html",
        reception: "reception/index.html",
        beds: "beds/index.html",
        ambulance: "ambulance/index.html",
        manager: "manager/index.html",
        admin: "admin/index.html"
    };

    document
        .querySelectorAll("[data-panel]")
        .forEach(button => {
            button.addEventListener("click", () => {
                const panel =
                    button.dataset.panel;

                if (panelMap[panel]) {
                    window.location.href =
                        panelMap[panel];
                }
            });
        });
}

/* =========================================================
   HOSPITAL INFO
   ========================================================= */

function setupHospitalInfo() {
    const emergencyButtons =
        document.querySelectorAll(
            "[data-emergency]"
        );

    emergencyButtons.forEach(button => {
        button.addEventListener("click", () => {
            showMessage(
                "Emergency services should be contacted immediately for urgent situations.",
                "error"
            );
        });
    });
}

/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        setupMedicineSearch();
        setupDoctorSearch();
        setupAppointmentForm();
        setupPatientLinks();
        setupDepartments();
        setupDateInputs();
        setupSmoothNavigation();
        setupRegistration();
        setupLogin();
        setupPanelNavigation();
        setupHospitalInfo();

        console.log(
            "Gopal Joshi Hospital frontend loaded successfully."
        );
    }
);

/* =========================================================
   GLOBAL ACCESS
   ========================================================= */

window.selectDoctor = selectDoctor;
window.searchMedicines = searchMedicines;
window.doctors = doctors;
window.medicines = medicines;
window.departments = departments;