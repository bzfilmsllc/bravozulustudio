import type { NextApiRequest, NextApiResponse } from "next";

type ActivityItem = {
  id: string;
  type: "script_created" | "project_created" | "member_joined" | "forum_post" | "friend_added" | "festival_submission";
  user: { id: string; firstName: string; lastName: string; profileImageUrl?: string; role: string; militaryBranch?: string };
  content: { title: string; description?: string; link?: string };
  createdAt: string;
  metadata?: any;
};

export default function handler(_req: NextApiRequest, res: NextApiResponse<ActivityItem[]>) {
  const now = new Date().toISOString();
  res.status(200).json([
    {
      id: "1",
      type: "project_created",
      user: { id: "u1", firstName: "Bravo", lastName: "Zulu", role: "verified" },
      content: { title: "Short Film: Echoes", description: "New project spinning up." },
      createdAt: now,
    },
    {
      id: "2",
      type: "script_created",
      user: { id: "u2", firstName: "Alex", lastName: "Smith", role: "member" },
      content: { title: "The Long Walk", description: "Draft v1 completed." },
      createdAt: now,
    },
  ]);
}
