export type PhotoVariant = "polaroid" | "tape" | "pin" | "clip";

export type PhotoLayout = {
  x: number;
  y: number;
  rotate: number;
  scale?: number;
  z?: number;
  variant: PhotoVariant;
};

export type PhotoItem = {
  id: string;
  title: string;
  location: string;
  date?: string;
  src?: string;
  width: number;
  height: number;
  layout: PhotoLayout;
};

export type PhotoRegion = {
  id: "chongqing" | "sichuan" | "guizhou" | "liaoning" | "jilin";
  name: string;
  subtitle: string;
  description: string;
  accent: string;
  photos: PhotoItem[];
};

export const photoRegions: PhotoRegion[] = [
  {
    id: "chongqing",
    name: "重庆",
    subtitle: "山城夜色 / River fog",
    description: "雾蓝、桥影、霓虹和层叠街巷构成的立体城市切片。",
    accent: "#38bdf8",
    photos: [
      {
        id: "cq-river-night",
        title: "江面雾光",
        location: "重庆 · 两江交汇",
        width: 1600,
        height: 1067,
        layout: { x: 8, y: 13, rotate: -7, scale: 1.14, z: 5, variant: "polaroid" },
      },
      {
        id: "cq-mountain-walk",
        title: "山城步道",
        location: "重庆 · 渝中",
        width: 1200,
        height: 1600,
        layout: { x: 39, y: 8, rotate: 5, scale: 0.98, z: 4, variant: "tape" },
      },
      {
        id: "cq-rail-light",
        title: "轨道穿楼",
        location: "重庆 · 李子坝",
        width: 1600,
        height: 1000,
        layout: { x: 62, y: 32, rotate: -4, scale: 1.12, z: 7, variant: "pin" },
      },
      {
        id: "cq-hotpot-steam",
        title: "火锅热气",
        location: "重庆 · 街边",
        width: 1200,
        height: 1200,
        layout: { x: 22, y: 56, rotate: 8, scale: 0.82, z: 6, variant: "clip" },
      },
    ],
  },
  {
    id: "sichuan",
    name: "四川",
    subtitle: "川西日照 / Plateau wind",
    description: "从城市茶馆到川西雪线，一路都是松林、晨光与高原风。",
    accent: "#86efac",
    photos: [
      {
        id: "sc-snowline",
        title: "川西雪线",
        location: "四川 · 川西",
        width: 1600,
        height: 1067,
        layout: { x: 9, y: 15, rotate: 6, scale: 1.15, z: 5, variant: "pin" },
      },
      {
        id: "sc-teahouse",
        title: "茶馆午后",
        location: "四川 · 成都",
        width: 1200,
        height: 1600,
        layout: { x: 44, y: 10, rotate: -6, scale: 0.96, z: 6, variant: "polaroid" },
      },
      {
        id: "sc-forest-road",
        title: "松林公路",
        location: "四川 · 高原公路",
        width: 1600,
        height: 1000,
        layout: { x: 64, y: 48, rotate: 5, scale: 1.02, z: 4, variant: "tape" },
      },
    ],
  },
  {
    id: "guizhou",
    name: "贵州",
    subtitle: "喀斯特雨季 / Stone and rain",
    description: "潮湿石巷、山间云线、苗寨灯火和雨后的绿色层次。",
    accent: "#2dd4bf",
    photos: [
      {
        id: "gz-terrace-rain",
        title: "雨后梯田",
        location: "贵州 · 山间",
        width: 1600,
        height: 1067,
        layout: { x: 10, y: 16, rotate: -5, scale: 1.12, z: 5, variant: "tape" },
      },
      {
        id: "gz-stone-alley",
        title: "石巷",
        location: "贵州 · 古镇",
        width: 1200,
        height: 1600,
        layout: { x: 47, y: 8, rotate: 8, scale: 0.95, z: 6, variant: "clip" },
      },
      {
        id: "gz-village-lights",
        title: "苗寨灯火",
        location: "贵州 · 苗寨",
        width: 1600,
        height: 1000,
        layout: { x: 65, y: 43, rotate: -7, scale: 1.03, z: 7, variant: "polaroid" },
      },
      {
        id: "gz-clouds",
        title: "山间云",
        location: "贵州 · 群山",
        width: 1200,
        height: 1200,
        layout: { x: 24, y: 59, rotate: 4, scale: 0.78, z: 4, variant: "pin" },
      },
    ],
  },
  {
    id: "liaoning",
    name: "辽宁",
    subtitle: "海风旧港 / Northern coast",
    description: "港口海风、旧厂房、北方街角与傍晚钢蓝色的空气。",
    accent: "#60a5fa",
    photos: [
      {
        id: "ln-coast-sunset",
        title: "海边落日",
        location: "辽宁 · 海岸线",
        width: 1600,
        height: 1067,
        layout: { x: 11, y: 18, rotate: 6, scale: 1.12, z: 5, variant: "polaroid" },
      },
      {
        id: "ln-old-factory",
        title: "旧厂房",
        location: "辽宁 · 工业遗址",
        width: 1200,
        height: 1600,
        layout: { x: 43, y: 10, rotate: -5, scale: 0.96, z: 6, variant: "clip" },
      },
      {
        id: "ln-street-corner",
        title: "北方街角",
        location: "辽宁 · 城市街边",
        width: 1600,
        height: 1000,
        layout: { x: 64, y: 47, rotate: 8, scale: 1.02, z: 4, variant: "pin" },
      },
    ],
  },
  {
    id: "jilin",
    name: "吉林",
    subtitle: "雪原与林海 / Snow field",
    description: "雾凇、雪原、松花江和寒冷空气里安静的蓝白色。",
    accent: "#bfdbfe",
    photos: [
      {
        id: "jl-rime",
        title: "雾凇",
        location: "吉林 · 江畔",
        width: 1600,
        height: 1067,
        layout: { x: 10, y: 14, rotate: -7, scale: 1.14, z: 5, variant: "pin" },
      },
      {
        id: "jl-snow-forest",
        title: "林海雪原",
        location: "吉林 · 林区",
        width: 1200,
        height: 1600,
        layout: { x: 47, y: 10, rotate: 5, scale: 0.96, z: 6, variant: "tape" },
      },
      {
        id: "jl-winter-station",
        title: "冬日车站",
        location: "吉林 · 车站",
        width: 1600,
        height: 1000,
        layout: { x: 65, y: 46, rotate: -4, scale: 1.02, z: 4, variant: "clip" },
      },
      {
        id: "jl-songhua-river",
        title: "松花江",
        location: "吉林 · 松花江",
        width: 1200,
        height: 1200,
        layout: { x: 25, y: 58, rotate: 8, scale: 0.78, z: 7, variant: "polaroid" },
      },
    ],
  },
];
