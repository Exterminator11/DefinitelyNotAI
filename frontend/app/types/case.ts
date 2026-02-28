export interface SingleCaseType {
  Case_snug: string;
  id: number;
  Record_Number: number;
  Caption: string;
  Brief_Description: string;
  Area_of_Application_List: string[];
  Area_of_Application_Text: string;
  Issue_Text: string;
  Issue_List: string[];
  Cause_of_Action_List: string[];
  Cause_of_Action_Text: string;
  Issue_List_OLD: string[];
  Issue_Text_OLD: string;
  Name_of_Algorithm_List: string[];
  Name_of_Algorithm_Text: string;
  Class_Action_list: string[];
  Class_Action: string;
  Organizations_involved: string;
  Jurisdiction_Filed: string;
  Date_Action_Filed: string;
  Current_Jurisdiction: string;
  Jurisdiction_Type: string[];
  Jurisdiction_Name: string;
  Published_Opinions: string;
  Published_Opinions_binary: boolean;
  Status_Disposition: string;
  Date_Added: string;
  Last_Update: string;
  Progress_Notes: string;
  Researcher: string;
  Summary_of_Significance: string;
  Summary_Facts_Activity_to_Date: string;
  Most_Recent_Activity: string;
  Most_Recent_Activity_Date: string;
  Keyword: string;
  Jurisdiction_Type_Text: string;

  Secondary_Sources?: SingleCaseSecondarySourceType[];
}

export interface SingleCaseSecondarySourceType {
  id: number;
  Case_Number: string;
  Secondary_Source_Link: string;
  Secondary_Source_Title: string;
}
