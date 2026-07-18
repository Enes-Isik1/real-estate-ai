// data/mockAnalysis.ts
import { DealAnalysis } from "../analysis";

export const mockDealAnalysis: DealAnalysis = {
  propertyName: "Villa Grünewald - Lindenallee 14",
  leadName: "Dr. Adrian Hoffmann",
  leadEmail: "hoffmann@anwalt-koeln.de",
  executiveSummary: "Highly attractive residential property in Cologne-Lindenthal. While buyer liquidity and overall transaction structure are exceptional, critical legal discrepancies regarding unregistered garden usage rights and a mandatory heating system upgrade (EnEV compliance) require immediate attention prior to notary appointment.",
  
  overallDealScore: 88,
  buyerReliability: 94,
  legalExposure: "Medium",
  financialExposure: "Low",
  
  aiRecommendation: "Proceed with Conditions",
  recommendationReason: "The transaction exhibits strong fundamentals, but signing must be delayed until the garden easement rights in Section II of the Land Register are fully resolved and the energy certificate upgrade costs are negotiated.",
  
  risks: [
    {
      id: "risk-1",
      level: "High",
      title: "Mandatory Heating Upgrade (EnEV/GEG)",
      page: 12,
      confidence: 98,
      whyItMatters: "According to current building laws, the gas central heating system (installed 1995) must be replaced within 2 years of acquisition. This represents an unplanned capex of €35,000 - €50,000.",
      originalQuote: "Die Beheizung erfolgt über eine Gas-Zentralheizung Baujahr 1995. Ein Austausch wurde bisher nicht vorgenommen.",
      aiInterpretation: "The property falls under the German GEG obligation to replace boilers older than 30 years upon change of ownership. Buyer must discount the purchase price to cover this liability."
    },
    {
      id: "risk-2",
      level: "Medium",
      title: "Unresolved Garden Easements",
      page: 3,
      confidence: 85,
      whyItMatters: "The garden area is currently fenced off and used exclusively by Ground Floor Unit, but no special usage rights ('Sondernutzungsrechte') are officially registered in the Land Register.",
      originalQuote: "Bezüglich der Gartennutzung ist anzumerken, dass diese faktisch durch den Mieter im EG erfolgt, eine dingliche Absicherung im Grundbuch jedoch aussteht.",
      aiInterpretation: "Risk of litigation among co-owners. The division declaration (Teilungserklärung) must be amended, which requires unanimous consent of all owners."
    },
    {
      id: "risk-3",
      level: "Low",
      title: "Minor Rental Arrears",
      page: 24,
      confidence: 90,
      whyItMatters: "Commercial tenant in Unit 3 has paid rent late in 2 out of the last 6 months. Minimal immediate threat but worth monitoring.",
      originalQuote: "Mieteinnahmen Gewerbe: Unregelmäßigkeiten im Zahlungseingang (Februar/April verspätet).",
      aiInterpretation: "Slight buyer reliability risk. Recommend requesting a bank guarantee or deposit enhancement."
    }
  ],

  missingDocuments: [
    { name: "Energy Performance Certificate", required: true, status: "Missing" },
    { name: "Division Declaration (Teilungserklärung)", required: true, status: "Available" },
    { name: "Fire Protection Assessment", required: false, status: "Pending" },
    { name: "Last 3 Meeting Minutes of Co-Owners", required: true, status: "Missing" }
  ],

  suggestedReply: `Dear Dr. Hoffmann,\n\nThank you for submitting the transaction dossier for Lindenallee 14. We have completed our preliminary AI-backed analysis of the documents.\n\nWhile the commercial and buyer metrics look highly favorable, we have flagged two critical conditions that need adjustments before drafting the purchase contract:\n1. The 1995 heating system requires a mandatory legal upgrade under the GEG guidelines (approx. €45k investment).\n2. The exclusive garden rights for the ground floor need official validation in the land register.\n\nLet's schedule a brief call tomorrow at 10:00 AM to discuss how we negotiate these items with the seller.\n\nBest regards,\nYour DealPilot Assistant`
};