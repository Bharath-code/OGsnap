// Fictional sites for marketing demos. Swap in real customers (with permission) once they exist.
export interface DemoBrand {
  domain: string;
  name: string;
  title: string;
  bg: string;
  fg: string;
  accent: string;
}

export const demoBrands: DemoBrand[] = [
  { domain: "tidepool.app", name: "Tidepool", title: "Build habits that stick, one tide at a time", bg: "#0A3A5C", fg: "#F7F3EA", accent: "#FF7A59" },
  { domain: "fernhouse.studio", name: "Fernhouse", title: "Interiors that feel like weekends", bg: "#1E3B2F", fg: "#F2EBDD", accent: "#C9F27B" },
  { domain: "kilnworks.co", name: "Kilnworks", title: "Handmade stoneware, fired in Leeds", bg: "#F6E7D8", fg: "#3A1F12", accent: "#C8553D" },
  { domain: "loopdesk.io", name: "Loopdesk", title: "Support inbox for tiny teams", bg: "#15133A", fg: "#F4F1FF", accent: "#8C7BFF" },
  { domain: "northpaw.vet", name: "Northpaw", title: "Vet visits without the waiting room", bg: "#FFE8F3", fg: "#46102E", accent: "#E0317E" },
  { domain: "gridnotes.app", name: "Gridnotes", title: "Notes that live on a grid", bg: "#102A2A", fg: "#E9FFF7", accent: "#2FD3A6" },
];
