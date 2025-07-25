# AI Flow Studio

AI Flow Studio is an innovative web application designed to empower users to create, visualize, and run complex Artificial Intelligence workflows through an intuitive drag-and-drop interface.

> **Note:** This application is currently operating under a temporary name. A formal renaming is planned for the future as the project evolves.

## Overview

AI Flow Studio democratizes access to AI capabilities by providing a dynamic digital canvas where users can visually connect different functional blocks (nodes) to build sophisticated AI-driven processes. Moving beyond traditional coding or complex setups, this application enables users to:

- Start with basic inputs like text or images
- Feed them into versatile "Instruction" nodes powered by various AI models
- Process outputs and chain nodes together to achieve complex results
- Visualize the entire workflow in a clear, intuitive interface

Whether you're a creative professional, developer, researcher, or business user, AI Flow Studio enables you to experiment with, prototype, and deploy custom AI solutions without requiring deep technical expertise in specific AI models.

## Features

- **Visual Node-Based Editor**: Intuitive drag-and-drop interface for creating AI workflows
- **Diverse Node Types**: Text, image, instruction nodes and more
- **AI Model Integration**: Support for various text generation, image generation, and analysis models including Gemini 2.0 Flash and Google Cloud TTS
- **Real-time Previews**: See outputs from each node as you build your workflow
- **Workflow Saving & Loading**: Save your workflows and load them for future use or modification
- **Customizable Node Parameters**: Fine-tune AI instructions and parameters for precise results
- **Canvas Navigation**: Zoom, pan, and organize your workflow for clarity
- **Export Capabilities**: Export your results and entire workflows

## Technology Stack

AI Flow Studio is built with a modern technology stack:

- **Frontend Framework**: [Next.js](https://nextjs.org/) - React framework with SSR/SSG capabilities
- **UI Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Backend & Database**: [Convex](https://convex.dev/) - Open-source reactive database
- **State Management**: [Jotai](https://jotai.org/) - Atomic, primitive state management for React
- **Diagramming/Flow**: [React Flow (@xyflow/react)](https://reactflow.dev/) - Library for building node-based editors
- **Payment Processing**: [Stripe](https://stripe.com/) - Secure payment infrastructure for subscription management
- **Authentication**: [Clerk](https://clerk.dev/) - Modern authentication and user management service for seamless sign-up, login, and auth workflows

## AI Models

AI Flow Studio integrates with powerful AI models to provide a wide range of capabilities:

| Category                          | Model                 | Description                                                                                          | Cost           | Speed            |
| --------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- | -------------- | ---------------- |
| **Text Generation & Instruction** | Gemini 2.5 Flash Lite | Basic text generation and instruction following                                                      | Free           | ⚡⚡⚡⚡⚡       |
|                                   | Gemini 2.5 Flash      | Advanced large language model for text generation, instruction following, and content transformation | Free           | ⚡⚡⚡⚡         |
| **Image Generation**              | GPT Image Gen 1       | High-quality image generation from text prompts                                                      | $0.01/image    | ⚡⚡ (15s/image) |
| **Speech & Audio**                | Gemini 2.5 Flash      | Text analysis and processing for speech content                                                      | Free           | ⚡⚡⚡⚡         |
|                                   | Azure AI TTS          | High-quality text-to-speech conversion with natural sounding voices                                  | Basically free | ⚡⚡⚡⚡         |

We continuously work to expand our supported models based on user needs and technological advancements.

## Pricing & Subscriptions

AI Flow Studio offers multiple subscription tiers to accommodate different user needs:

- **Free (0€)**: A generous free tier for learning and experimenting with AI workflows
- **Plus (4€/month)**: Increased rate limits and additional features for regular users
- **Pro (10€/month)**: Highest rate limits and full access to all premium features

We're committed to maintaining a balance between accessibility and sustainability. Our approach ensures that casual users and learners have access to powerful AI capabilities through our free tier, while providing enhanced features and higher usage limits for power users through our paid subscriptions.

All subscriptions are managed through Stripe's secure payment processing system.

## Rate Limits

Each subscription tier comes with different rate limits for our core features. All rate limits represent the number of operations per month for each feature.

### Account & Whiteboard Limits

| Feature                             | Free Tier | Plus Tier | Pro Tier  |
| ----------------------------------- | --------- | --------- | --------- |
| **Amount of whiteboards**           | 5         | 50        | Unlimited |
| **Amount of nodes in a whiteboard** | 10        | 50        | 100       |

### Content Generation Limits

| Feature                        | Free Tier | Plus Tier | Pro Tier |
| ------------------------------ | --------- | --------- | -------- |
| **Text Generation from Image** | 10        | 100       | 250      |
| **Image Generation**           | 10        | 100       | 250      |
| **Instruction Use**            | 20        | 200       | 500      |
| **Speech Generation**          | 3         | 35        | 100      |

### Integration Limits

| Feature                | Free Tier | Plus Tier | Pro Tier |
| ---------------------- | --------- | --------- | -------- |
| **Weather Use**        | 1         | 30        | 60       |
| **Website Generation** | 1         | 10        | 40       |

### Premium Features

| Feature                           | Free Tier | Plus Tier | Pro Tier |
| --------------------------------- | --------- | --------- | -------- |
| **Workflow History & Versioning** | ❌        | ❌        | ✅       |
| **Priority Support**              | ❌        | ✅        | ✅       |
| **Beta features**                 | ❌        | ✅        | ✅       |

If the user uses all limits they can each month, we won't have any profit. Of course, we don't expect the user to always reach the limits.

## Getting Started

### Prerequisites

- Node.js
- pnpm
- Supabase account (for backend services)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/SuperJakov/AI-Flow-Studio.git
   cd ai-flow-studio
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials and other required variables

4. Run the development server

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage Examples

### Basic Text-to-Image Workflow

1. Drag a text node onto the canvas
2. Type a detailed description for an image
3. Drag an image node onto the canvas
4. Connect the text node to the image node
5. Execute the workflow to generate your image

### Image edit workflow

1. Follow instructions before this
2. Add instruction node to your canvas
3. Connect the generate image node with your instruction node
4. Type instruction on how to edit the image in the instruction node
5. Run the instruction node

## Contributing

We welcome contributions to AI Flow Studio! Please feel free to submit pull requests, create issues, or suggest enhancements.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Recommending New AI Models

We're always looking to expand our supported AI models. To recommend a new model:

1. Open an issue on our GitHub repository
2. Use the title format: "Model Request: [Model Name]"
3. In the description, please include:
   - Model name and provider
   - Key capabilities and use cases
   - Any API documentation links
   - Why you believe this model would benefit AI Flow Studio users

Our team will review all model recommendations and prioritize based on user demand and technical feasibility.

## Acknowledgments

- Thanks to all the open-source libraries that made this project possible
- Special thanks to our contributors and early adopters

## To-do

### Core Functionality

- [x] Basic auth
- [x] Drag & Drop interface
- [x] Text nodes
- [x] Image nodes
- [x] Image editing using instruction node
- [ ] Image model selection
- [x] Image style selection
- [x] Speech node
- [ ] Speech style selection

### User Management & Monetization

- [ ] Stable user tiers with Stripe
- [x] Ratelimit whiteboard creation for specific tiers

### Additional Node Types

- [ ] Logic node
- [ ] Math node
- [ ] Timer node
- [ ] Email Node
- [ ] Website node
- [ ] Weather node
- [ ] Data Fetching Node

### User Experience & Documentation

- [x] Whiteboard previews on `/whiteboards`
- [ ] Mobile responsive design
- [ ] Docs
- [ ] Onboarding tutorial/guided tour
- [ ] Workflow templates/starter examples
- [ ] Workflow versioning

### Analytics & Monitoring

- [ ] Posthog for analytics
- [x] Sentry for error handling and user feedback

### Collaboration Features

- [x] Collaboration: Sharing whiteboards
- [ ] Collaboration: Permissions, real-time collaboration
- [ ] Projects

---

### Launch Preparation

- [ ] Rebrand our product & Get a domain
- [ ] Ship to production 🥳

### Post-Launch

- [ ] Get feedback from real users
- [ ] Compete in Croatia

## Where I left off

- [] Demo video on Home Page
- [] Text & Speech nodes in docs
- [] Finish all examples & Make it work
- [] Better README for SoM
- [] Make sign in more accessible for users that don't give e-mail

- Ship 1, wait for cert

- [] Fix gallery
- [] Better error handling when running nodes
- [] Finish docs
- [] Blog
- [] Website node
