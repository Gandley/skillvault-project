#!/bin/bash
# Copy skill ZIPs from attachments to public download folder
SRC="/home/node/.openclaw/workspaces/jake/attachments/2026/may/25"
DST="/home/node/.openclaw/workspaces/jake/skill-repo/public/skills"

cp "$SRC/trend-intelligence-skill.zip" "$DST/trend-intelligence.zip"
cp "$SRC/analytics-feedback-loop-skill.zip" "$DST/analytics-feedback-loop.zip"
cp "$SRC/content-calendar-skill.zip" "$DST/content-calendar.zip"
cp "$SRC/article-cue-v3.zip" "$DST/article-cue.zip"
cp "$SRC/video-cue-v3.zip" "$DST/video-cue.zip"
cp "$SRC/repurposing-engine-skill.zip" "$DST/repurposing-engine.zip"
cp "$SRC/telegram-bot.zip" "$DST/telegram-bot.zip"
cp "$SRC/blotato-social.zip" "$DST/blotato-social.zip"
cp "$SRC/social-post-pipeline-v3.zip" "$DST/social-post-pipeline.zip"
cp "$SRC/lead-magnet-builder-skill.zip" "$DST/lead-magnet-builder.zip"
cp "$SRC/nova-orchestrator-skill.zip" "$DST/nova-orchestrator.zip"

echo "Copied 11 skill ZIPs to $DST"
ls -la "$DST"
