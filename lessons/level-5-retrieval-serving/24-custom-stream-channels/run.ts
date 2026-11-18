import { buildObservedGraph, collectNodeStatuses, latestByNode } from "./channels";

for (const failAt of [undefined, "work"]) {
  const { statuses, failed } = await collectNodeStatuses(buildObservedGraph(failAt));
  console.log(`\nรัน${failAt ? `ที่ node ${failAt} ล้ม` : "สำเร็จ"} (failed=${failed})`);
  console.log(" event custom:node-status:", statuses.map((s) => `${s.node}:${s.status}`).join(" "));
  console.log(" สถานะล่าสุด:", JSON.stringify(latestByNode(statuses)));
}
