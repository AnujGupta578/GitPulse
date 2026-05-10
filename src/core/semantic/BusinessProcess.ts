export interface IProcessStep {
    id: string;
    description: string;
    actor: string;
    dependencies: string[];
}

export interface IBusinessProcess {
    id: string;
    name: string;
    domain: string;
    steps: IProcessStep[];
}

export interface ISemanticSummary {
    processId: string;
    executiveSummary: string;
    technicalImpact: string;
    complexityScore: number; // 1 to 10
}
