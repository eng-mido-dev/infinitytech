export type ProjectStatus = "active" | "completed" | "archived";
export type FileType = "gerbers" | "schematic" | "model3d" | "source";
export type MediaType = "image" | "video";
export type UpdateType = "release" | "feature" | "fix" | "design" | "test" | "note";
export type CommitType = "create" | "update" | "release" | "fix" | "design";

export interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  description: string;
  size: string;
  url?: string;
  uploadedAt: string;
}

export interface ProjectMedia {
  id: string;
  type: MediaType;
  url: string;
  caption: string;
  captionAr: string;
  uploadedAt: string;
}

export interface ProjectUpdate {
  id: string;
  date: string;
  version: string;
  title: string;
  titleAr: string;
  desc: string;
  descAr: string;
  type: UpdateType;
  adminOnly: boolean;
}

export interface Commit {
  hash: string;
  message: string;
  timestamp: string;
  type: CommitType;
  fields: string[];
}

export interface AdminProject {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  overview: string;
  overviewAr: string;
  problem: string;
  problemAr: string;
  solution: string;
  solutionAr: string;
  tags: string[];
  status: ProjectStatus;
  codeSnippet: string;
  language: string;
  githubUrl: string;
  timeline: { date: string; title: string; desc: string }[];
  files: ProjectFile[];
  media: ProjectMedia[];
  updates: ProjectUpdate[];
  commits: Commit[];
  createdAt: string;
  updatedAt: string;
  views: number;
  downloads: number;
}
