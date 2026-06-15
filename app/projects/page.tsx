import ProjectCard from "@/components/ProjectCard";

const projects = [
  {
    slug: "cqupt-src",
    name: "校园漏洞响应与安全学习平台",
    description: "CQUPT-SRC — 连接漏洞响应、学习实践、证书激励与校园安全共建",
    detail: "React + NestJS + Prisma + PostgreSQL + Hermes Agent + DeepSeek · 全栈安全平台",
    tags: ["全栈", "React", "NestJS", "安全"],
    image: "/projects/cqupt-src.jpg",
  },
  {
    slug: "holocubic",
    name: "HoloCubic · 全息小电视",
    description: "基于 ESP32-PICO-D4 的开源桌面小电视 — 从元器件采购、PCB 打样、外壳定制到固件二次开发全链路实践",
    detail: "ESP32-PICO-D4 + LVGL + C++ · 嵌入式全息小电视 / 桌面信息终端",
    tags: ["嵌入式", "ESP32", "C++", "LVGL", "硬件"],
    image: "/projects/holocubic.jpg",
  },
  {
    slug: "zonora",
    name: "个人博客网站",
    description: "Zonora — 用文字、项目与三维视觉记录思考和创造的个人博客网站",
    detail: "Next.js + TypeScript + Three.js · 个人博客 / 作品展示网站",
    tags: ["博客", "Next.js", "TypeScript", "Three.js"],
    image: "/projects/zonora-blog.png",
    icon: "🌐",
  },
];

export default function ProjectsPage() {
  return (
    <section className="page-section">
      <h1 className="page-title">项目</h1>
      <p className="page-lead">
        全栈开发、安全研究与三维可视化项目。
      </p>

      <div className="card-grid">
        {projects.map((proj) => (
          <ProjectCard key={proj.slug} {...proj} />
        ))}
      </div>
    </section>
  );
}
