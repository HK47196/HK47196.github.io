+++
title = "Application Support Case Studies"
layout = "case-study"
+++

These case studies show application-support work at incident scale. The point is to show what I checked and how I knew the fix landed.

{{< callout type="note" title="Scope note" >}}
The useful checks were plain ones: logs, a comparison client, a known prior issue, the maintained fork, and a user-visible refresh.
{{< /callout >}}

## Resolving a Production Matrix Web Client Issue in 20 Minutes

{{< flow title="Scope isolation" items="user report|Synapse logs|comparison Matrix client|hosted web client fork|rebuild and redeploy|refresh validation" >}}

### Context

A client reported a production rendering problem in their hosted Matrix web client. I treated the report as an application support issue and started by separating the likely layers: Synapse, Matrix generally, and the client's hosted web client fork.

### Problem / impact

The issue affected visible behavior in a production chat client. I kept the investigation focused on observable application behavior and non-sensitive diagnostics while working to restore the hosted client quickly.

### Timeline

- Acknowledged the report at about 2:14 PM.
- Deployed the fix at about 2:34 PM.
- Resolved the issue in roughly 20 minutes from acknowledgment to fix.

### Investigation

- Reviewed Synapse and homeserver logs first to look for backend failure signals.
- Tested the same behavior in another Matrix client.
- Confirmed the issue did not reproduce there, narrowing the likely fault to the hosted web client fork rather than Synapse or Matrix generally.
- Matched the behavior to a similar prior issue, which gave the fix a clear direction.

### Resolution

I made the fix in the maintained hosted client fork, rebuilt the web client, redeployed the updated build, and asked users to refresh.

### Validation checklist

- [x] Checked Synapse and homeserver logs for backend failure signals.
- [x] Compared behavior against another Matrix client.
- [x] Narrowed likely fault to the hosted web client fork.
- [x] Rebuilt and redeployed the updated hosted client.
- [x] Asked users to refresh and confirm the fixed build was served.

### Validation / outcome

The refreshed hosted client served the fixed build within about 20 minutes of acknowledgment. Log review and comparative client testing kept the scope narrow and separated backend health from client-side rendering behavior.

### Skills demonstrated

Production support, incident triage, log review, server/client isolation, comparative testing across clients, root-cause narrowing, code changes in a maintained fork, build and redeploy workflow, user-facing validation, and clear communication.
