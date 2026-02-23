# Joanne Nova Defense (Joanne新星防御)

一个基于 React + Vite + Tailwind CSS 开发的经典导弹防御类网页游戏。

## 🎮 游戏特色
- **经典玩法**：灵感来源于《Missile Command》，预判敌机轨迹并进行拦截。
- **上海地标**：背景包含上海“三件套”（上海中心、环球金融中心、金茂大厦）。
- **视觉特效**：烟花爆炸效果、敌机与导弹的动态轨迹。
- **双语支持**：支持中英文切换。
- **响应式设计**：适配手机和电脑端。

## 🚀 部署到 Vercel

1. **上传到 GitHub**:
   - 在 GitHub 上创建一个新仓库。
   - 将代码推送到仓库：
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin <你的仓库地址>
     git push -u origin main
     ```

2. **连接到 Vercel**:
   - 登录 [Vercel](https://vercel.com/)。
   - 点击 "Add New" -> "Project"。
   - 导入你的 GitHub 仓库。
   - **环境变量** (可选): 如果你后续使用了 Gemini AI 功能，请在 Vercel 的 Project Settings -> Environment Variables 中添加 `GEMINI_API_KEY`。
   - 点击 "Deploy"。

## 🛠️ 技术栈
- React 19
- Vite
- Tailwind CSS 4
- Lucide React (图标)
- Motion (动画)

## 📜 游戏规则
1. 点击屏幕发射导弹拦截敌机。
2. 导弹在点击位置爆炸产生范围伤害。
3. 保护底部的城市和炮台不被摧毁。
4. 击毁敌机获得积分，达到1000分获胜。
5. 炮台弹药有限，每轮结束后会自动补充。
