// scripts/seed-demo-deal.ts
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Lädt Umgebungsvariablen aus der .env.local im Root-Verzeichnis
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Fehler: SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY fehlen in der .env.local!");
  process.exit(1);
}

// Enterprise-Client mit Service Role Key für Admin-Rechte beim Seeding
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function seedDemoDeal() {
  console.log("🌱 [Seed] Starte Injektion des Enterprise Demo-Deals: 'Lakefront Villa Munich'...");
  const startTime = Date.now();

  try {
    // 1. Deal anlegen
    const { data: deal, error: dealError } = await supabaseAdmin
      .from("deals")
      .insert([
        {
          title: "Lakefront Villa Munich",
          status: "Needs Review"
        }
      ])
      .select()
      .single();

    if (dealError || !deal) {
      throw new Error(`Fehler beim Erstellen des Deals: ${dealError?.message || "Unbekannter Fehler"}`);
    }

    const dealId = deal.id;
    console.log(`✨ [Seed] Deal erfolgreich erstellt (ID: ${dealId})`);

    // 2. Dokumente verknüpfen
    const documents = [
      { deal_id: dealId, filename: "Teilungserklärung_Lakefront_Villa.pdf", document_type: "Teilungserklärung", upload_date: new Date().toISOString() },
      { deal_id: dealId, filename: "WEG_Protokoll_2025.pdf", document_type: "Eigentümerversammlung", upload_date: new Date().toISOString() },
      { deal_id: dealId, filename: "Wirtschaftsplan_2026.pdf", document_type: "Wirtschaftsplan", upload_date: new Date().toISOString() },
      { deal_id: dealId, filename: "Energieausweis_fehlt.pdf", document_type: "Energieausweis", upload_date: new Date().toISOString() },
    ];

    const { error: docError } = await supabaseAdmin.from("documents").insert(documents);
    if (docError) {
      console.warn("⚠️ [Seed] Warnung beim Einfügen der Dokumente:", docError.message);
    } else {
      console.log(`📁 [Seed] ${documents.length} Dokumente verknüpft.`);
    }

    // 3. Vollständiges Analyseergebnis definieren
    const aiAnalysis = {
      leadScore: 64,
      executiveSummary: "Die Lakefront Villa in München zeigt eine exklusive Seelage, weist jedoch im WEG-Protokoll signifikante Instandhaltungsrückstaus (Dachsanierung) sowie ungeklärte Sondernutzungsrechte am Garten auf.",
      overallRecommendation: "Solides Objekt mit Verhandlungspotenzial. Vor Kauf Zusage zur Dachsanierung und Kostenübernahme klären.",
      confidence: 9,
      verificationRequired: true,
      topRisks: [
        {
          severity: "High",
          title: "Geplante Dachsanierung (Sonderumlage droht)",
          whyItMatters: "Im Protokoll der letzten WEG wurde eine Dachsanierung diskutiert, die auf die Eigentümer umgelegt werden könnte.",
          confidence: 95,
          source: { pageNumber: 4 }
        },
        {
          severity: "Medium",
          title: "Unklare Gartennutzung",
          whyItMatters: "Das Sondernutzungsrecht für den Gartenanteil ist in der Teilungserklärung unklar formuliert.",
          confidence: 88,
          source: { pageNumber: 12 }
        }
      ],
      positiveFindings: [
        { title: "Sehr ruhige Seelage mit hoher Wertstabilität", description: "Die Lage bietet langfristig exzellentes Wertsteigerungspotenzial." }
      ],
      missingDocuments: [
        { name: "Gültiger Energieausweis", impact: "High" }
      ],
      negotiationPoints: [
        { title: "Kaufpreisreduktion wegen anstehender Sanierung", target: "Ca. 35.000 € Nachlass fordern" }
      ]
    };

    // 4. Analyse in der 'analyses'-Tabelle speichern
    const { data: savedAnalysis, error: analysisError } = await supabaseAdmin
      .from("analyses")
      .insert([
        {
          deal_id: dealId,
          version: 1,
          lead_score: 64,
          executive_summary: aiAnalysis.executiveSummary,
          overall_recommendation: aiAnalysis.overallRecommendation,
          raw_json: aiAnalysis
        }
      ])
      .select()
      .single();

    if (analysisError || !savedAnalysis) {
      throw new Error(`Fehler beim Speichern der Analyse: ${analysisError?.message}`);
    }
    console.log(`📊 [Seed] Analyse-Ergebnis (Version 1) gespeichert.`);

    // 5. Risiken separat in der 'risks'-Tabelle abspeichern
    if (aiAnalysis.topRisks && aiAnalysis.topRisks.length > 0) {
      const riskInserts = aiAnalysis.topRisks.map((risk) => ({
        analysis_id: savedAnalysis.id,
        deal_id: dealId,
        severity: risk.severity,
        title: risk.title,
        why_it_matters: risk.whyItMatters,
        confidence: risk.confidence,
        page_number: risk.source.pageNumber
      }));

      const { error: riskError } = await supabaseAdmin.from("risks").insert(riskInserts);
      if (riskError) {
        console.warn("⚠️ [Seed] Warnung beim Speichern der Risiken:", riskError.message);
      } else {
        console.log(`🚨 [Seed] ${riskInserts.length} Risiken separat registriert.`);
      }
    }

    console.log(`\n🎉 [Seed] ERFOLGREICH ABGESCHLOSSEN in ${Date.now() - startTime}ms!`);
    console.log(`👉 Dein Demo-Deal 'Lakefront Villa Munich' ist jetzt in Supabase bereit.`);

  } catch (error: any) {
    console.error("🔥 [Seed] KRITISCHER FEHLER IM SEED-PROZESS:", error.message);
    process.exit(1);
  }
}

seedDemoDeal();