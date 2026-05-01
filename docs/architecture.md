# System Architecture (Automated)
        
> [!NOTE]
> This document is automatically generated from commit intent. **Zero manual updates required.**

### **Visual Legend**
- <span style="color:#28a745">■</span> **Added**: New architectural component in this commit.
- <span style="color:#ffc107">■</span> **Modified**: Existing component with logic/structural changes.
- <span style="color:#007bff">■</span> **Persistent**: Unchanged component from previous baseline.

---

## Visual Overview

```mermaid
C4Context
    title Architecture Overview
    System(OrderService, "OrderService", "class_definition")
    UpdateElementStyle(OrderService, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(AnalysisRequest, "AnalysisRequest", "class_definition")
    UpdateElementStyle(AnalysisRequest, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(analyze_commit, "analyze_commit", "function_definition")
    UpdateElementStyle(analyze_commit, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(perform_analysis, "perform_analysis", "function_definition")
    UpdateElementStyle(perform_analysis, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(cli_trigger, "cli_trigger", "function_definition")
    UpdateElementStyle(cli_trigger, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(AgentState, "AgentState", "class_definition")
    UpdateElementStyle(AgentState, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(architect_agent, "architect_agent", "function_definition")
    UpdateElementStyle(architect_agent, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(security_agent, "security_agent", "function_definition")
    UpdateElementStyle(security_agent, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(synthesis_agent, "synthesis_agent", "function_definition")
    UpdateElementStyle(synthesis_agent, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(create_council_graph, "create_council_graph", "function_definition")
    UpdateElementStyle(create_council_graph, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(StructuralChange, "StructuralChange", "class_definition")
    UpdateElementStyle(StructuralChange, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(SecurityRisk, "SecurityRisk", "class_definition")
    UpdateElementStyle(SecurityRisk, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(IntentObject, "IntentObject", "class_definition")
    UpdateElementStyle(IntentObject, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(BrowserAction, "BrowserAction", "class_definition")
    UpdateElementStyle(BrowserAction, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(WalkthroughSeed, "WalkthroughSeed", "class_definition")
    UpdateElementStyle(WalkthroughSeed, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(WalkthroughSeeder, "WalkthroughSeeder", "class_definition")
    UpdateElementStyle(WalkthroughSeeder, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(IntentParser, "IntentParser", "class_definition")
    UpdateElementStyle(IntentParser, $bgColor="#e7f3ff", $borderColor="#007bff")
    System(ArchitectureSynthesizer, "ArchitectureSynthesizer", "class_definition")
    UpdateElementStyle(ArchitectureSynthesizer, $bgColor="#e7f3ff", $borderColor="#007bff")
    Boundary(b_PaymentEngine, "PaymentEngine", "class") {
        Component(PaymentEngine, "PaymentEngine", "class")
        System(StripeAdapter, "StripeAdapter", "class")
    UpdateElementStyle(StripeAdapter, $bgColor="#fff3cd", $borderColor="#ffc107")
    }
    UpdateElementStyle(PaymentEngine, $bgColor="#fff3cd", $borderColor="#ffc107")
```

## Semantic Changelog

> **Commit**: `feat-payment-engine`
> **Rationale**: Implementing a robust Payment Engine with C4 mapping.

### Changes in this Commit

#### Component Layer
- **PaymentEngine** (class) `#service`: New core service for transaction orchestration.

#### Code Layer
- **StripeAdapter** (class) : Third-party payment gateway integration.

## 🛡️ Security Insights
- **[High]**: Hardcoded test key in StripeAdapter  
  *Recommendation*: Use env variables.
