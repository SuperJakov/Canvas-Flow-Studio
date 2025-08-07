export const companyMeetingTemplate = {
  title: "Company Meeting",
  nodes: [
    {
      data: {
        isLocked: false,
        text: "Meeting Transcript, July 22, 2025 | Weekly Product + Marketing Sync\n\nParticipants:\n- Emma (PM Lead)\n- Liam (Marketing Manager)\n- Sophia (UX Designer)\n- Noah (Engineer)\n- Olivia (Data Analyst)\n- James (CEO, joining late)\n\n---\n\nEmma: Alright, everyone, let’s get started. I know James will be joining in about 10 minutes, so we can begin with product updates. Noah, can you walk us through the progress on the onboarding redesign?\n\nNoah: Sure. We finished the new logic for the user goals quiz, and the backend integration is stable. We're still QA'ing the edge cases with skipped questions, but otherwise, we’re looking good for staging by Wednesday.\n\nSophia: Just a quick note, we’re still waiting on copy updates from content. Some of the placeholders like “goal_1_label” are still visible in the prototype.\n\nLiam: I’ll follow up with Clara today, she said she'd deliver final copy yesterday, but I’ll nudge her again.\n\nEmma: Thanks. So staging on Wednesday is still realistic?\n\nNoah: Yeah, unless we hit something unexpected in QA.\n\nEmma: Great. Next - Olivia, any updates on the usage funnel data?\n\nOlivia: Yes. I pulled data from June 1 to July 20. The drop-off at step three has actually improved by 8.4% after the tooltip update, so it seems like the nudge helped. But weirdly, step five completion is down by 3%.\n\nEmma: Step five… that’s the personalization screen, right?\n\nSophia: Yeah, the one with all the checkboxes. We actually had some complaints from support that it felt overwhelming.\n\nOlivia: That tracks. Also, mobile users convert 15% worse on that screen.\n\nNoah: Maybe we hide the less popular options behind a “More Preferences” link?\n\nEmma: Let’s mark that for sprint discussion. Action item: Sophia and Noah - ideate on a simpler personalization flow, especially for mobile.\n\nSophia: Got it.\n\nNoah: On it.\n\nLiam: Speaking of conversion - can we talk about the launch timing for the summer campaign? We’re still targeting August 5, but I need confirmation the onboarding changes will be deployed by then.\n\nEmma: We’ll make that date, as long as we don’t find major QA blockers this week.\n\nLiam: Alright. Also, we need visuals for the campaign. Can design commit to banner assets by Friday?\n\nSophia: If we get final copy by Wednesday morning, yes. Otherwise, it’s tight.\n\nEmma: Liam, let’s make that a blocking dependency for your team. Final copy by Wednesday 9 AM, no later.\n\nLiam: Got it. Adding it to our Asana board.\n\n[James joins the call]\n\nJames: Hey folks, sorry I’m late - ran over in another meeting. Anything urgent for me?\n\nEmma: We’re mostly aligned. One quick thing - we want your take on the updated pricing tiers before the deck goes to legal.\n\nJames: Yep, I’ll review that today. Just send me the latest version.\n\nEmma: Will do. Anything from your end?\n\nJames: Just a heads-up, the board review was rescheduled to August 12. So we get a few extra days to polish metrics. Olivia, can you prep a dashboard showing user growth YoY and churn by segment?\n\nOlivia: Sure. When do you need that by?\n\nJames: Let’s say August 8.\n\nOlivia: Okay, noted.\n\nEmma: Alright, let’s wrap up with action items. I’ll share full notes later, but quickly:\n- Sophia + Noah: Redesign personalization flow, focus on mobile.\n- Liam: Follow up with Clara on copy today.\n- Liam: Ensure final campaign copy is delivered by Wednesday 9 AM.\n- Sophia: Prepare banner assets by Friday, assuming copy is on time.\n- Emma: Send pricing deck to James.\n- Olivia: Build board review dashboard by August 8.\n\nEveryone: Sounds good. / Got it. / Thanks, all.\n\n[Meeting Ends]",
      },
      height: 220,
      id: "1470c22b-5b4c-4e15-ba51-a353908abe54",
      position: { x: -94.5, y: -15 },
      type: "textEditor",
      width: 500,
      zIndex: 1,
    },
    {
      id: "a8966510-3119-4dbd-a92d-e402047d23a1",
      type: "instruction",
      position: { x: 540.2940138502341, y: 285.4716603669727 },
      data: {
        isLocked: false,
        text: "Summarize the main points discussed in the meeting.",
      },
      zIndex: 2,
    },
    {
      id: "71fca06f-8f60-4e07-a17f-01bbbaaa1d23",
      type: "instruction",
      position: { x: -12.005164565556505, y: 303.63467863917333 },
      data: {
        isLocked: false,
        text: "List all action items mentioned, with assignees and deadlines if available.",
      },
      zIndex: 4,
    },
    {
      id: "eda1788c-bfa5-4ad3-993c-bef76116284b",
      type: "instruction",
      position: { x: -617.0457012611, y: 263.70843235564143 },
      data: {
        isLocked: false,
        text: "Identify any open questions or topics that require follow-up and list them. List the questions without meeting transcript",
      },
      zIndex: 15,
    },
    {
      id: "c2d8c43f-7ccc-4ed8-90b8-33772588cc79",
      type: "comment",
      position: { x: -464.8279664469361, y: -7.3984631577845885 },
      data: {
        isLocked: true,
        text: "This is an example meeting transcript. Try your own!",
      },
      zIndex: 17,
      width: 265,
      height: 159,
    },
  ] as const,
  edges: [
    {
      source: "1470c22b-5b4c-4e15-ba51-a353908abe54",
      target: "a8966510-3119-4dbd-a92d-e402047d23a1",
      id: "1ada0387-5ac8-47db-93f2-817ec98775ae",
      type: "default",
    },
    {
      source: "1470c22b-5b4c-4e15-ba51-a353908abe54",
      target: "71fca06f-8f60-4e07-a17f-01bbbaaa1d23",
      id: "6eee6e28-a074-46a5-91fe-00d0eb9bda8c",
      type: "default",
    },
    {
      source: "1470c22b-5b4c-4e15-ba51-a353908abe54",
      target: "eda1788c-bfa5-4ad3-993c-bef76116284b",
      id: "bdbca356-13eb-4ca1-a2e1-7d58004afd37",
      type: "default",
    },
  ] as const,
};
