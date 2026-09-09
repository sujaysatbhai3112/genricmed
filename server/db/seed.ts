/**
 * MongoDB seed — populates medicines and delivery options on first run
 */

import { Medicine } from '../models/Medicine.js';
import { DeliveryOption } from '../models/DeliveryOption.js';

export async function seedDatabase(): Promise<void> {
  const existing = await Medicine.countDocuments();
  if (existing > 0) {
    console.log('  Database already seeded, skipping.');
    return;
  }

  // ─── Medicine catalog ────────────────────────────────────────────────────────
  const medicines = [
    {
      legacyId: 'med-lipitor-20',
      brandName: 'Lipitor (20mg)',
      brandManufacturer: 'Pfizer Pharmaceuticals',
      brandPrice: 46.50,
      activeIngredient: 'Atorvastatin Calcium (20mg)',
      category: 'heart-bp',
      treatmentFor: 'Lowers LDL Cholesterol & Prevents Cardiovascular Events',
      rxRequired: true,
      description: 'HMG-CoA reductase inhibitor (statin) used to decrease low-density lipoprotein (LDL) and triglycerides in blood while elevating HDL.',
      dosageInstructions: 'Take 1 tablet daily at evening or bedtime, with or without food. Avoid grapefruit juice.',
      commonSideEffects: ['Mild muscle aches', 'Headache', 'Digestive upset', 'Fatigue'],
      precautions: ['Inform your doctor if experiencing unexplained muscle tenderness', 'Regular liver enzyme testing recommended', 'Contraindicated in active liver disease or pregnancy'],
      storageAdvice: 'Store below 25°C in a dry place away from direct sunlight.',
      suggestedGenerics: [
        { name: 'Atorvastatin 20mg (Cipla Generics)', manufacturer: 'Cipla Quality Healthcare', price: 7.20, packSize: 'Strip of 10 tablets', dosageForm: 'Film-coated Tablet', strength: '20mg', savingsPercentage: 84, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 1420, deliveryEta: 'Today in 60 mins' },
        { name: 'Atorvastatin Tab 20mg (Teva)', manufacturer: 'Teva Pharmaceuticals', price: 8.50, packSize: 'Strip of 10 tablets', dosageForm: 'Oral Tablet', strength: '20mg', savingsPercentage: 81, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.8, ratingCount: 890, deliveryEta: 'Today by 8 PM' },
      ],
    },
    {
      legacyId: 'med-augmentin-625',
      brandName: 'Augmentin (625mg)',
      brandManufacturer: 'GlaxoSmithKline (GSK)',
      brandPrice: 29.80,
      activeIngredient: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
      category: 'antibiotics',
      treatmentFor: 'Bacterial Infections (Respiratory, ENT, Urinary & Skin)',
      rxRequired: true,
      description: 'Broad-spectrum penicillin antibiotic combined with beta-lactamase inhibitor to overcome bacterial resistance.',
      dosageInstructions: 'Take 1 tablet twice daily with meals to optimize absorption and prevent gastric discomfort.',
      commonSideEffects: ['Mild diarrhea', 'Nausea', 'Skin rash'],
      precautions: ['Complete the entire prescribed course even if symptoms resolve', 'Inform doctor if allergic to penicillin or cephalosporins', 'Stay well-hydrated throughout the regimen'],
      storageAdvice: 'Store in moisture-proof blister pack below 25°C.',
      suggestedGenerics: [
        { name: 'Amoxyclav 625 (Mankind Pharma)', manufacturer: 'Mankind Life Sciences', price: 5.90, packSize: 'Strip of 10 tablets', dosageForm: 'Coated Tablet', strength: '500mg + 125mg', savingsPercentage: 80, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 2310, deliveryEta: 'Today in 45 mins' },
        { name: 'Amoxicillin & Pot Clavulanate (Alkem)', manufacturer: 'Alkem Laboratories Ltd.', price: 6.40, packSize: 'Strip of 10 tablets', dosageForm: 'Film-coated Tablet', strength: '500mg + 125mg', savingsPercentage: 78, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.7, ratingCount: 650, deliveryEta: 'Tomorrow by 11 AM' },
      ],
    },
    {
      legacyId: 'med-glucophage-500',
      brandName: 'Glucophage / Glycomet (500mg)',
      brandManufacturer: 'Merck Healthcare',
      brandPrice: 19.50,
      activeIngredient: 'Metformin Hydrochloride (500mg)',
      category: 'diabetes',
      treatmentFor: 'Type 2 Diabetes Glycemic Control',
      rxRequired: true,
      description: 'First-line biguanide antihyperglycemic medication that decreases hepatic glucose synthesis and enhances peripheral insulin sensitivity.',
      dosageInstructions: 'Take 1 tablet with or after meals (breakfast/dinner) to reduce GI disturbance.',
      commonSideEffects: ['Flatulence', 'Mild abdominal cramps', 'Metallic taste in mouth'],
      precautions: ['Monitor HbA1c and kidney function test (eGFR) periodically', 'Temporarily withhold prior to iodinated radiocontrast procedures', 'Avoid excessive alcohol consumption'],
      storageAdvice: 'Store at room temperature 20°C to 25°C away from humidity.',
      suggestedGenerics: [
        { name: 'Metformin HCl 500mg (Sun Pharma)', manufacturer: 'Sun Pharma Ltd.', price: 2.60, packSize: 'Strip of 20 tablets', dosageForm: 'Sustained Release Tablet', strength: '500mg', savingsPercentage: 86, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 3840, deliveryEta: 'Today in 45 mins' },
        { name: 'Metformin 500mg (Torrent Generic)', manufacturer: 'Torrent Pharma', price: 2.80, packSize: 'Strip of 20 tablets', dosageForm: 'Extended Release Tablet', strength: '500mg', savingsPercentage: 85, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.8, ratingCount: 1120, deliveryEta: 'Today by 8 PM' },
      ],
    },
    {
      legacyId: 'med-panadol-crocin-650',
      brandName: 'Crocin / Panadol Advance (650mg)',
      brandManufacturer: 'Haleon / GSK Consumer',
      brandPrice: 8.80,
      activeIngredient: 'Paracetamol / Acetaminophen (650mg)',
      category: 'pain-fever',
      treatmentFor: 'Fever Relief, Body Aches, Headache & Mild Arthritis',
      rxRequired: false,
      description: 'Analgesic and antipyretic agent providing safe relief from elevated body temperatures and moderate pain syndromes.',
      dosageInstructions: 'Take 1 tablet every 4 to 6 hours as needed. Maximum 3,000mg within 24 hours.',
      commonSideEffects: ['Extremely well-tolerated at recommended doses', 'Rare allergic skin rash'],
      precautions: ['Never exceed maximum 4,000mg daily to protect liver health', 'Do not combine with other OTC cold/cough syrups containing acetaminophen', 'Consult physician if fever persists > 3 days'],
      storageAdvice: 'Keep in original blister foil in a dry room.',
      suggestedGenerics: [
        { name: 'Paracetamol 650mg (Micro Labs Certified)', manufacturer: 'Micro Labs CleanForm', price: 1.30, packSize: 'Strip of 15 tablets', dosageForm: 'Oral Tablet', strength: '650mg', savingsPercentage: 85, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 5.0, ratingCount: 9450, deliveryEta: 'Today in 30 mins' },
      ],
    },
    {
      legacyId: 'med-nexium-40',
      brandName: 'Nexium (40mg)',
      brandManufacturer: 'AstraZeneca Pharmaceuticals',
      brandPrice: 38.00,
      activeIngredient: 'Esomeprazole Magnesium (40mg)',
      category: 'stomach-acidity',
      treatmentFor: 'GERD, Acid Reflux, Heartburn & Peptic Ulcer Healing',
      rxRequired: true,
      description: 'Potent proton pump inhibitor (PPI) that decreases stomach gastric hydrochloric acid secretion.',
      dosageInstructions: 'Take 1 tablet once daily in the morning, 30 to 60 minutes before breakfast.',
      commonSideEffects: ['Mild headache', 'Diarrhea or constipation', 'Abdominal pain'],
      precautions: ['Swallow whole; do not crush or chew enteric-coated pellets', 'Long-term continuous therapy should be periodically re-evaluated by physician', 'Ensure adequate intake of dietary calcium and magnesium'],
      storageAdvice: 'Protect from moisture, store below 30°C.',
      suggestedGenerics: [
        { name: 'Esomeprazole 40mg (Lupin Generics)', manufacturer: 'Lupin Pharmaceuticals', price: 4.80, packSize: 'Strip of 10 capsules', dosageForm: 'Delayed-Release Capsule', strength: '40mg', savingsPercentage: 87, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 1890, deliveryEta: 'Today in 45 mins' },
        { name: "Esomeprazole DR 40mg (Dr. Reddy's)", manufacturer: "Dr. Reddy's Laboratories", price: 5.20, packSize: 'Strip of 10 capsules', dosageForm: 'Enteric-Coated Capsule', strength: '40mg', savingsPercentage: 86, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.8, ratingCount: 940, deliveryEta: 'Today by 8 PM' },
      ],
    },
    {
      legacyId: 'med-norvasc-5',
      brandName: 'Norvasc (5mg)',
      brandManufacturer: 'Viatris / Pfizer',
      brandPrice: 24.50,
      activeIngredient: 'Amlodipine Besylate (5mg)',
      category: 'heart-bp',
      treatmentFor: 'Hypertension (High Blood Pressure) & Chronic Angina',
      rxRequired: true,
      description: 'Dihydropyridine calcium channel blocker that relaxes arterial smooth muscles and lowers systemic peripheral resistance.',
      dosageInstructions: 'Take 1 tablet daily at any set time, with a glass of water.',
      commonSideEffects: ['Peripheral edema (mild ankle swelling)', 'Flushing', 'Dizziness on standing'],
      precautions: ['Maintain consistent daily blood pressure readings log', 'Do not abruptly discontinue without consulting cardiologist', 'Rise slowly from sitting or lying down positions'],
      storageAdvice: 'Store at 15°C - 30°C away from humidity.',
      suggestedGenerics: [
        { name: 'Amlodipine Besylate 5mg (Zydus Lifesciences)', manufacturer: 'Zydus Cadila Healthcare', price: 3.10, packSize: 'Strip of 15 tablets', dosageForm: 'Oral Tablet', strength: '5mg', savingsPercentage: 87, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 2200, deliveryEta: 'Today in 45 mins' },
      ],
    },
    {
      legacyId: 'med-allegra-120',
      brandName: 'Allegra (120mg)',
      brandManufacturer: 'Sanofi Consumer Health',
      brandPrice: 22.00,
      activeIngredient: 'Fexofenadine Hydrochloride (120mg)',
      category: 'allergy-cold',
      treatmentFor: 'Seasonal Allergic Rhinitis, Sneezing, Runny Nose & Hives',
      rxRequired: false,
      description: 'Second-generation non-sedating antihistamine that selectively blocks peripheral H1 receptors without causing sleepiness.',
      dosageInstructions: 'Take 1 tablet once daily with water. Avoid drinking fruit juices 2 hours before or after.',
      commonSideEffects: ['Extremely minimal drowsiness', 'Dry mouth', 'Headache'],
      precautions: ['Do not take with aluminum/magnesium antacids within 2 hours', 'Safe for driving and daytime activities unlike older antihistamines'],
      storageAdvice: 'Store below 25°C in cool, dry conditions.',
      suggestedGenerics: [
        { name: 'Fexofenadine 120mg (Cipla Generics)', manufacturer: 'Cipla Quality Healthcare', price: 4.20, packSize: 'Strip of 10 tablets', dosageForm: 'Film-coated Tablet', strength: '120mg', savingsPercentage: 81, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 3100, deliveryEta: 'Today in 45 mins' },
      ],
    },
    {
      legacyId: 'med-plavix-75',
      brandName: 'Plavix (75mg)',
      brandManufacturer: 'Sanofi / Bristol-Myers Squibb',
      brandPrice: 54.00,
      activeIngredient: 'Clopidogrel Bisulfate (75mg)',
      category: 'heart-bp',
      treatmentFor: 'Blood Clot Prevention in Heart Attack & Stroke Survivors',
      rxRequired: true,
      description: 'Antiplatelet prodrug that inhibits ADP-induced platelet aggregation to reduce arterial thrombosis.',
      dosageInstructions: 'Take 1 tablet once daily at the same time, with or without food.',
      commonSideEffects: ['Easier bruising', 'Nosebleeds', 'Mild gastrointestinal bleeding'],
      precautions: ['Strictly do not skip doses without doctor instruction', 'Notify surgeons and dentists that you take antiplatelet therapy prior to any procedures', 'Avoid unprescribed NSAID painkillers like ibuprofen'],
      storageAdvice: 'Store between 15°C and 30°C.',
      suggestedGenerics: [
        { name: 'Clopidogrel 75mg (Torrent Pharma)', manufacturer: 'Torrent Pharmaceuticals', price: 7.80, packSize: 'Strip of 10 tablets', dosageForm: 'Film-coated Tablet', strength: '75mg', savingsPercentage: 85, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 1620, deliveryEta: 'Today in 60 mins' },
      ],
    },
    {
      legacyId: 'med-zoloft-50',
      brandName: 'Zoloft (50mg)',
      brandManufacturer: 'Pfizer / Upjohn',
      brandPrice: 47.00,
      activeIngredient: 'Sertraline Hydrochloride (50mg)',
      category: 'mental-wellness',
      treatmentFor: 'Major Depressive Disorder, Generalized Anxiety & Panic Disorders',
      rxRequired: true,
      description: 'Selective serotonin reuptake inhibitor (SSRI) that restores balanced neurotransmitter levels in the brain.',
      dosageInstructions: 'Take 1 tablet once daily, either morning or evening, consistently with food.',
      commonSideEffects: ['Nausea in first 2 weeks', 'Mild insomnia', 'Dry mouth', 'Sweating'],
      precautions: ['Full therapeutic effects typically develop over 3 to 4 weeks', 'Never cease medication abruptly; follow tapering guidelines under medical guidance', "Avoid combining with St. John's wort or MAO inhibitors"],
      storageAdvice: 'Store in dry place below 30°C.',
      suggestedGenerics: [
        { name: 'Sertraline HCl 50mg (Sun Pharma)', manufacturer: 'Sun Pharma Ltd.', price: 6.90, packSize: 'Strip of 10 tablets', dosageForm: 'Oral Film Tablet', strength: '50mg', savingsPercentage: 85, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.8, ratingCount: 1250, deliveryEta: 'Today in 60 mins' },
      ],
    },
    {
      legacyId: 'med-crestor-10',
      brandName: 'Crestor (10mg)',
      brandManufacturer: 'AstraZeneca',
      brandPrice: 45.00,
      activeIngredient: 'Rosuvastatin Calcium (10mg)',
      category: 'heart-bp',
      treatmentFor: 'Severe Hypercholesterolemia & Atherosclerosis Prevention',
      rxRequired: true,
      description: 'High-potency statin that substantially lowers bad LDL and total cholesterol while stabilizing arterial plaques.',
      dosageInstructions: 'Take 1 tablet daily with or without food at any hour of day.',
      commonSideEffects: ['Muscle ache', 'Headache', 'Abdominal pain'],
      precautions: ['Report any unexplained dark urine or severe muscle cramping promptly', 'Periodic lipid panels every 3 to 6 months advised'],
      storageAdvice: 'Store below 30°C.',
      suggestedGenerics: [
        { name: 'Rosuvastatin 10mg (Macleods Pharma)', manufacturer: 'Macleods Certified Generics', price: 6.50, packSize: 'Strip of 10 tablets', dosageForm: 'Film-coated Tablet', strength: '10mg', savingsPercentage: 85, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 2040, deliveryEta: 'Today in 45 mins' },
      ],
    },
    {
      legacyId: 'med-januvia-100',
      brandName: 'Januvia (100mg)',
      brandManufacturer: 'Merck & Co. (MSD)',
      brandPrice: 62.00,
      activeIngredient: 'Sitagliptin Phosphate (100mg)',
      category: 'diabetes',
      treatmentFor: 'Type 2 Diabetes DPP-4 Enzyme Inhibition',
      rxRequired: true,
      description: 'Dipeptidyl peptidase-4 (DPP-4) inhibitor that boosts active incretin hormone concentrations to regulate post-prandial insulin.',
      dosageInstructions: 'Take 1 tablet daily with or without meals.',
      commonSideEffects: ['Upper respiratory tract stuffiness', 'Mild headache'],
      precautions: ['Low risk of hypoglycemia when used as monotherapy', 'Dose adjustment required in moderate to severe renal impairment'],
      storageAdvice: 'Store below 25°C.',
      suggestedGenerics: [
        { name: 'Sitagliptin 100mg (Glenmark Pure)', manufacturer: 'Glenmark Life Sciences', price: 11.50, packSize: 'Strip of 10 tablets', dosageForm: 'Oral Tablet', strength: '100mg', savingsPercentage: 81, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.8, ratingCount: 970, deliveryEta: 'Today by 8 PM' },
      ],
    },
    {
      legacyId: 'med-zyrtec-10',
      brandName: 'Zyrtec / Cetzine (10mg)',
      brandManufacturer: 'Johnson & Johnson / UCB',
      brandPrice: 11.50,
      activeIngredient: 'Cetirizine Hydrochloride (10mg)',
      category: 'allergy-cold',
      treatmentFor: 'Allergic Rhinitis, Eye Watering, Sneezing, Skin Itch',
      rxRequired: false,
      description: 'Antihistamine providing rapid relief from seasonal pollen and environmental allergy triggers.',
      dosageInstructions: 'Take 1 tablet once daily in the evening.',
      commonSideEffects: ['Mild drowsiness in some individuals', 'Dry mouth'],
      precautions: ['Use caution if operating machinery until you know how it affects you'],
      storageAdvice: 'Store below 25°C.',
      suggestedGenerics: [
        { name: 'Cetirizine HCl 10mg (Alkem Care)', manufacturer: 'Alkem Laboratories Ltd.', price: 1.80, packSize: 'Strip of 10 tablets', dosageForm: 'Oral Film Tablet', strength: '10mg', savingsPercentage: 84, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 4210, deliveryEta: 'Today in 30 mins' },
      ],
    },
    {
      legacyId: 'med-shelcal-500',
      brandName: 'Shelcal / Caltrate (500mg)',
      brandManufacturer: 'Torrent / Pfizer Consumer',
      brandPrice: 14.50,
      activeIngredient: 'Elemental Calcium (500mg) + Vitamin D3 (250 IU)',
      category: 'vitamins-immunity',
      treatmentFor: 'Osteoporosis Prevention, Bone Density & Joint Support',
      rxRequired: false,
      description: 'Essential mineral and bioavailable cholecalciferol formulation optimizing bone matrix mineralization.',
      dosageInstructions: 'Take 1 tablet daily after main lunch or dinner meal.',
      commonSideEffects: ['Mild constipation if fluid intake is low'],
      precautions: ['Drink at least 6-8 glasses of water throughout the day'],
      storageAdvice: 'Store in airtight container away from light.',
      suggestedGenerics: [
        { name: 'Calcium Carbonate + Vit D3 500mg (Cipla Generic)', manufacturer: 'Cipla Consumer Healthcare', price: 3.20, packSize: 'Bottle of 30 tablets', dosageForm: 'Coated Caplet', strength: '500mg + 250 IU', savingsPercentage: 78, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 3100, deliveryEta: 'Today in 45 mins' },
      ],
    },
    {
      legacyId: 'med-pantocid-40',
      brandName: 'Pantocid / Protonix (40mg)',
      brandManufacturer: 'Sun Pharma / Pfizer',
      brandPrice: 26.00,
      activeIngredient: 'Pantoprazole Sodium (40mg)',
      category: 'stomach-acidity',
      treatmentFor: 'Erosive Esophagitis, Hyperacidity & Stomach Gastritis',
      rxRequired: true,
      description: 'Gastric proton pump inhibitor reducing acidity and shielding stomach mucosa.',
      dosageInstructions: 'Take 1 tablet once daily morning before food.',
      commonSideEffects: ['Mild headache', 'Dizziness'],
      precautions: ['Take 30 minutes prior to first meal of the day for maximal efficacy'],
      storageAdvice: 'Store below 25°C.',
      suggestedGenerics: [
        { name: 'Pantoprazole Gastro-Resistant 40mg (Lupin)', manufacturer: 'Lupin Pharmaceuticals', price: 3.90, packSize: 'Strip of 10 tablets', dosageForm: 'Delayed-Release Tablet', strength: '40mg', savingsPercentage: 85, fdaApproved: true, whoGmpCertified: true, labTested: true, inStock: true, rating: 4.9, ratingCount: 2650, deliveryEta: 'Today in 45 mins' },
      ],
    },
  ];

  await Medicine.insertMany(medicines);
  console.log(`  Seeded ${medicines.length} medicines`);

  // ─── Delivery options ─────────────────────────────────────────────────────
  const deliveryOptCount = await DeliveryOption.countDocuments();
  if (deliveryOptCount === 0) {
    await DeliveryOption.insertMany([
      { optionId: 'express',  name: '⚡ Express Doorstep',       estimatedTime: 'Within 45-90 minutes', price: 3.99, badge: 'Fastest',    isActive: true, sortOrder: 1 },
      { optionId: 'same-day', name: '📦 Same-Day Evening',        estimatedTime: 'Today by 8:00 PM',     price: 1.99, badge: 'Popular',    isActive: true, sortOrder: 2 },
      { optionId: 'standard', name: '🚚 Standard Free Delivery',  estimatedTime: 'Tomorrow afternoon',   price: 0.00, badge: 'Free on $25+', isActive: true, sortOrder: 3 },
    ]);
    console.log('  Seeded 3 delivery options');
  }
}
