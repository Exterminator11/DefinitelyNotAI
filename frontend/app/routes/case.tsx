import React from "react";
import { Link, useLoaderData, useNavigation } from "react-router";
import type { Route } from "../+types/root";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Description from "@mui/icons-material/Description";
import Gavel from "@mui/icons-material/Gavel";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Person from "@mui/icons-material/Person";
import FolderOpen from "@mui/icons-material/FolderOpen";
import LinkIcon from "@mui/icons-material/Link";
import Assessment from "@mui/icons-material/Assessment";
import Place from "@mui/icons-material/Place";
import { getRequest } from "../api/baseApi";
import { MOCK_CASE } from "~/mocks/case";
import type { SingleCaseType } from "~/types/case";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DAIL Assistant - Case Details" },
    { name: "description", content: "Case details and secondary sources" },
  ];
}

export async function loader({
  params,
}: {
  params: { id?: string };
}): Promise<{ case: SingleCaseType }> {
  // Mock request: real API will use getCase(params.id) later
  const caseData = (await getRequest(
    `/cases/${params.id ?? ""}`,
    MOCK_CASE,
  )) as SingleCaseType;
  return { case: caseData };
}

function SingleCasePage() {
  const { case: caseData } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl px-4 md:px-8 py-8 flex items-center justify-center min-h-[40vh]">
        <p className="text-muted-foreground">Loading case…</p>
      </div>
    );
  }

  const secondarySources = caseData.Secondary_Sources ?? [];

  return (
    <div className="w-full max-w-6xl px-4 md:px-8 py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowBack sx={{ fontSize: 18 }} />
            Back to home
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
          {caseData.Caption}
        </h1>
        {caseData.Brief_Description && (
          <p className="text-muted-foreground text-base">
            {caseData.Brief_Description}
          </p>
        )}
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Description sx={{ fontSize: 20 }} className="text-primary" />
              <CardTitle>Overview</CardTitle>
            </div>
            <CardDescription>Summary and significance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseData.Summary_of_Significance && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Significance
                </h4>
                <p className="text-sm text-foreground">
                  {caseData.Summary_of_Significance}
                </p>
              </div>
            )}
            {caseData.Summary_Facts_Activity_to_Date && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Facts & activity to date
                </h4>
                <p className="text-sm text-foreground">
                  {caseData.Summary_Facts_Activity_to_Date}
                </p>
              </div>
            )}
            {caseData.Most_Recent_Activity && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Most recent activity
                  {caseData.Most_Recent_Activity_Date && (
                    <span className="ml-2 text-muted-foreground font-normal">
                      ({caseData.Most_Recent_Activity_Date})
                    </span>
                  )}
                </h4>
                <p className="text-sm text-foreground">
                  {caseData.Most_Recent_Activity}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gavel sx={{ fontSize: 20 }} className="text-primary" />
              <CardTitle>Case metadata</CardTitle>
            </div>
            <CardDescription>Jurisdiction, dates, status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(caseData.Jurisdiction_Filed || caseData.Current_Jurisdiction) && (
              <div className="flex items-start gap-2">
                <Place
                  sx={{ fontSize: 16 }}
                  className="text-muted-foreground mt-0.5 shrink-0"
                />
                <div className="text-sm">
                  {caseData.Jurisdiction_Name && (
                    <p className="font-medium text-foreground">
                      {caseData.Jurisdiction_Name}
                    </p>
                  )}
                  {(caseData.Jurisdiction_Filed ||
                    caseData.Current_Jurisdiction) && (
                    <p className="text-muted-foreground">
                      {[
                        caseData.Jurisdiction_Filed,
                        caseData.Current_Jurisdiction,
                      ]
                        .filter(Boolean)
                        .join(" → ")}
                    </p>
                  )}
                </div>
              </div>
            )}
            {caseData.Date_Action_Filed && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarToday
                  sx={{ fontSize: 16 }}
                  className="text-muted-foreground shrink-0"
                />
                <span className="text-muted-foreground">Filed:</span>
                <span className="text-foreground">
                  {caseData.Date_Action_Filed}
                </span>
              </div>
            )}
            {caseData.Status_Disposition && (
              <div className="flex items-center gap-2 text-sm">
                <Assessment
                  sx={{ fontSize: 16 }}
                  className="text-muted-foreground shrink-0"
                />
                <span className="text-muted-foreground">Status:</span>
                <span className="text-foreground">
                  {caseData.Status_Disposition}
                </span>
              </div>
            )}
            {caseData.Researcher && (
              <div className="flex items-center gap-2 text-sm">
                <Person
                  sx={{ fontSize: 16 }}
                  className="text-muted-foreground shrink-0"
                />
                <span className="text-muted-foreground">Researcher:</span>
                <span className="text-foreground">{caseData.Researcher}</span>
              </div>
            )}
            {(caseData.Date_Added || caseData.Last_Update) && (
              <div className="pt-2 text-xs text-muted-foreground">
                Added: {caseData.Date_Added}
                {caseData.Last_Update &&
                  ` · Last update: ${caseData.Last_Update}`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Classifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Assessment sx={{ fontSize: 20 }} className="text-primary" />
              <CardTitle>Classifications</CardTitle>
            </div>
            <CardDescription>
              Areas, issues, causes of action, algorithms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseData.Area_of_Application_List?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Areas of application
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {caseData.Area_of_Application_List.map((area, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {caseData.Issue_List?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Issues
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {caseData.Issue_List.map((issue, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {issue}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {caseData.Cause_of_Action_List?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Causes of action
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {caseData.Cause_of_Action_List.map((cause, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {cause}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {caseData.Name_of_Algorithm_List?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Algorithms
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {caseData.Name_of_Algorithm_List.map((algo, i) => (
                    <Badge key={i} variant="default" className="text-xs">
                      {algo}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {caseData.Jurisdiction_Type?.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Jurisdiction type
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {caseData.Jurisdiction_Type.map((j, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {j}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Secondary sources - full width */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderOpen sx={{ fontSize: 20 }} className="text-primary" />
              <CardTitle>Secondary sources</CardTitle>
            </div>
            <CardDescription>
              Related documents, articles, and external links
            </CardDescription>
          </CardHeader>
          <CardContent>
            {secondarySources.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No secondary sources recorded for this case.
              </p>
            ) : (
              <ul className="space-y-3">
                {secondarySources.map((source) => (
                  <li
                    key={source.id}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {source.Secondary_Source_Title}
                      </p>
                      {source.Case_Number && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Case: {source.Case_Number}
                        </p>
                      )}
                    </div>
                    <a
                      href={source.Secondary_Source_Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline shrink-0"
                    >
                      <LinkIcon sx={{ fontSize: 16 }} />
                      Open link
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SingleCasePage;
