---
title: "MicroRules: A Tiny Expression Language for C#"
date: 2025-06-29T00:00:00Z
draft: false
tags: ["csharp", "dotnet", "dsl", "compiler", "expression-language"]
categories: ["Programming", "Projects"]
summary: "Building a domain-specific language that compiles string expressions into strongly-typed C# functions at runtime"
---

I built **MicroRules** because I got tired of writing verbose conditional logic for business rules that changed frequently. What started as a simple expression parser evolved into a full-featured domain-specific language that compiles string expressions into strongly-typed, executable C# functions.

## The Problem

Business logic is messy. You have discount calculations, shipping rules, access control, content moderation - all these rules that seem simple but get complex fast. Traditional approaches either scatter this logic throughout your codebase or force you into heavy rule engines that are overkill for most scenarios.

I wanted something lightweight that could express rules compactly while maintaining strong typing and performance.

## The Solution

MicroRules takes string expressions and compiles them into actual .NET functions at runtime. Not interpreted - compiled. The result is a tiny DSL that's both readable and fast.

Here's a simple discount rule:
```csharp
var discountRule = MicroRules.Compile<SelfFunc<Customer, double>>("SpendTotal > 100 ? 0.1 : 0");
double discount = discountRule(customer);
```

## Pattern Matching for Complex Logic

The real power comes from pattern matching. Take shipping costs - traditionally a nightmare of nested if-statements:

```
(zone, weight, service, membership) -> {
    (Domestic, <= 5, Express, Premium): baseCost * 0.8,
    (International, _, _, Premium): baseCost * 1.2,
    (_, > 20, Ground, _): baseCost + (weight - 20) * surchargeRate,
    (Remote, _, _, _): baseCost * 1.5,
    _: baseCost
}
```

This tuple-based pattern matching supports exact values, range comparisons (`<= 5`, `> 20`), and wildcards (`_`). First match wins, so you can layer specific cases over general ones.

## LINQ Integration

Modern business rules often involve collections. MicroRules supports LINQ operations with lambda expressions:

```
// Block checkout if any item is unavailable
cart.items.Any(i => i.inventory <= 0)

// Check if user has required permissions
user.permissions.All(p => p.level >= AdminLevel && p.active)
```

## Collection Contains Patterns

```
(patientAge, weight, condition, allergies) -> {
    (>= 65, _, Hypertension, ['ace-inhibitor']): alternativeDose * 0.5,
    (< 18, < 50, _, _): pediatricDose,
    (_, >= 100, Diabetes, _): standardDose * 1.2,
    _: standardDose
}
```

The `['ace-inhibitor']` checks if the allergies collection contains that specific value. Works with arrays, lists, dictionaries, and even strings (substring search).

## Technical Implementation

Under the hood, MicroRules uses a three-stage compilation pipeline:

1. **Lexer** - Tokenizes expressions with support for string literals, numbers, operators, and identifiers
2. **Parser** - Recursive descent parser building LINQ Expression trees with proper operator precedence
3. **Compiler** - Wraps compiled expressions in strongly-typed delegates

The parser handles some tricky features:
- **Enum inference** - `weaponType == Sword` automatically infers `WeaponType.Sword` from context
- **Mixed arithmetic** - Integers and doubles play nicely together
- **Extension methods** - Full LINQ support plus custom extension method discovery
- **Deep member access** - `user.profile.settings.theme` just works

## Type Safety and Performance

Everything is strongly typed. The compiler validates member access, enum values, and type conversions at compile time. Invalid expressions throw clear error messages before your code ever runs.

Performance-wise, compiled expressions run at native .NET speed. The compilation cost is paid once - after that, it's just a function call.

## Usage Patterns

I designed MicroRules around two main usage patterns:

**Custom delegates** for multi-parameter scenarios:
```csharp
public delegate double PricingRule(Order order, double basePrice);
var rule = MicroRules.Compile<PricingRule>("order.Items.Any(i => i.Category == Premium) ? basePrice * 1.2 : basePrice");
```

**SelfFunc** for single-parameter cases where you want implicit property lookup:
```csharp
var rule = MicroRules.Compile<SelfFunc<Customer, bool>>("Age >= 18 && CreditScore > 600");
bool eligible = rule(customer);
```

The "self" in SelfFunc enables that clean syntax where `Age` automatically resolves to `customer.Age`.

*MicroRules is open source and available on [GitHub](https://github.com/HK47196/MicroRules).
