import type { SingleCaseType } from "~/types/case";

export const MOCK_CASE: SingleCaseType = {
  Case_snug: "loomis-v-wisconsin",
  id: 1,
  Record_Number: 1001,
  Caption: "State v. Loomis – Wisconsin Supreme Court",
  Brief_Description:
    "Challenge to use of proprietary risk assessment algorithm (COMPAS) in criminal sentencing. Court upheld use but required warning about limitations.",
  Area_of_Application_List: ["Criminal Justice", "Sentencing", "Risk Assessment"],
  Area_of_Application_Text:
    "Criminal Justice; Sentencing; Risk Assessment",
  Issue_Text:
    "Whether use of proprietary algorithmic risk scores at sentencing without disclosure of underlying methodology violates due process.",
  Issue_List: [
    "Due process",
    "Algorithmic transparency",
    "Sentencing discretion",
    "Proprietary software",
  ],
  Cause_of_Action_List: ["Due process", "Right to meaningful review"],
  Cause_of_Action_Text: "Due process; Right to meaningful review",
  Issue_List_OLD: [],
  Issue_Text_OLD: "",
  Name_of_Algorithm_List: ["COMPAS", "Risk assessment"],
  Name_of_Algorithm_Text: "COMPAS; Risk assessment",
  Class_Action_list: ["No"],
  Class_Action: "No",
  Organizations_involved: "Wisconsin Dept. of Corrections; Northpointe (now Equivant)",
  Jurisdiction_Filed: "Wisconsin",
  Date_Action_Filed: "2013-07-22",
  Current_Jurisdiction: "Wisconsin Supreme Court",
  Jurisdiction_Type: ["State", "Supreme Court"],
  Jurisdiction_Name: "Wisconsin Supreme Court",
  Published_Opinions: "Yes",
  Published_Opinions_binary: true,
  Status_Disposition: "Decided – upheld with conditions",
  Date_Added: "2016-08-01",
  Last_Update: "2024-01-15",
  Progress_Notes:
    "Landmark case on algorithmic fairness in sentencing. Follow-up scholarship and legislative attention ongoing.",
  Researcher: "Research Team A",
  Summary_of_Significance:
    "First major state supreme court ruling on use of algorithmic risk assessment in sentencing. Court permitted use but required trial courts to provide cautionary language about limitations and not rely on the algorithm as sole basis for sentencing.",
  Summary_Facts_Activity_to_Date:
    "Loomis challenged his sentence in part on the use of COMPAS risk scores. Wisconsin Supreme Court affirmed the sentence, holding that the sentencing court used COMPAS as one factor among many and provided appropriate warnings. The court did not require disclosure of proprietary algorithms.",
  Most_Recent_Activity: "Scholarship and policy discussion on algorithmic sentencing continue.",
  Most_Recent_Activity_Date: "2024-01-10",
  Keyword: "COMPAS; sentencing; risk assessment; due process; Wisconsin",
  Jurisdiction_Type_Text: "State; Supreme Court",
  Secondary_Sources: [
    {
      id: 1,
      Case_Number: "2016AP157-CR",
      Secondary_Source_Link: "https://www.wicourts.gov/sc/opinion/DisplayDocument.pdf?content=pdf&seqNo=181266",
      Secondary_Source_Title: "Wisconsin Supreme Court Opinion (PDF)",
    },
    {
      id: 2,
      Case_Number: "2016AP157-CR",
      Secondary_Source_Link: "https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing",
      Secondary_Source_Title: "ProPublica – Machine Bias (Risk Assessments in Criminal Sentencing)",
    },
    {
      id: 3,
      Case_Number: "2016AP157-CR",
      Secondary_Source_Link: "https://scholarship.law.berkeley.edu/cgi/viewcontent.cgi?article=3813&context=californialawreview",
      Secondary_Source_Title: "Berkeley Law Review – Algorithmic Accountability in Criminal Sentencing",
    },
  ],
};

export const MOCK_CASES: SingleCaseType[] = [
  MOCK_CASE,
  {
    ...MOCK_CASE,
    Case_snug: "epic-systems-v-lewis",
    id: 2,
    Record_Number: 1002,
    Caption: "Epic Systems Corp. v. Lewis",
    Brief_Description: "Arbitration agreements and class action waivers in employment contracts.",
    Status_Disposition: "Decided",
    Date_Added: "2017-06-01",
    Keyword: "arbitration; class action; employment",
    Secondary_Sources: [],
  },
  {
    ...MOCK_CASE,
    Case_snug: "carpenter-v-united-states",
    id: 3,
    Record_Number: 1003,
    Caption: "Carpenter v. United States",
    Brief_Description: "Fourth Amendment and cell-site location information.",
    Status_Disposition: "Decided",
    Date_Added: "2018-07-01",
    Keyword: "Fourth Amendment; privacy; cell data",
    Secondary_Sources: [],
  },
];
