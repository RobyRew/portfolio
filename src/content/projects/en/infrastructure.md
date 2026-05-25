---
locale: en
title: VPS Infrastructure as Code
summary: Ansible-managed Debian 12 VPS with security-first hardening — Tailscale, CrowdSec, Restic to Backblaze B2, Beszel monitoring, Dokploy PaaS for app deploys.
status: active
year: 2026
order: 5
featured: true
category: infrastructure
tech:
  - Ansible
  - Debian
  - Docker
  - Dokploy
  - Traefik
  - Tailscale
  - CrowdSec
  - Restic
  - Backblaze B2
  - Beszel
  - UFW
  - auditd
  - Lynis
  - AppArmor
links:
  repo: https://github.com/robyrew/infrastructure
---

The repository that runs my own production infrastructure on a 2 GB IONOS VPS — and the one I use as a teaching example for "what a small, defensible self-hosted stack looks like in 2026."

Highlights:

- **Bootstrap script** that takes a fresh Debian 12 VPS from `ssh root@…` to fully hardened, key-only access in about ten minutes.
- **Modular Ansible roles** for kernel hardening, SSH lockdown, UFW + Docker-aware firewall, CrowdSec IPS, auditd, Lynis, AppArmor.
- **Dokploy** as the PaaS layer so deploying a new app is "connect repo, point domain, click deploy."
- **Tailscale** SSH for admin access — no public Dokploy or metrics panel.
- **Restic** backups to Backblaze B2 with a **weekly automated restore test** (backups that aren't restored aren't backups).
- Every operational procedure documented as a runbook entry, including a full DR plan.
