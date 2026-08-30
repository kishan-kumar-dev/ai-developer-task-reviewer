$ErrorActionPreference = "Stop"

$apiUrl = "http://localhost:3000/api/analyze"

$cases = @(
    @{
        id = "CASE-001"
        name = "E-commerce"
        task = "Build an e-commerce application with authentication, product catalog, search, shopping cart, Stripe checkout, secure Stripe webhooks, PostgreSQL database, inventory management, order history, and automated tests."
    },
    @{
        id = "CASE-002"
        name = "Authentication"
        task = "Build a web application with user registration, login, logout, password hashing, session management, protected routes, authorization, and automated tests."
    },
    @{
        id = "CASE-003"
        name = "REST API"
        task = "Build a REST API with CRUD operations, request validation, authentication, authorization, PostgreSQL persistence, error handling, pagination, and automated tests."
    },
    @{
        id = "CASE-004"
        name = "Payment"
        task = "Build a payment integration using Stripe checkout, secure webhook signature verification, successful payment handling, failed payment handling, idempotency, and automated tests."
    },
    @{
        id = "CASE-005"
        name = "Inventory"
        task = "Build inventory management with products, stock quantities, stock reservation, stock decrement after purchase, prevention of negative inventory, and automated tests."
    },
    @{
        id = "CASE-006"
        name = "Order History"
        task = "Build an order management system where authenticated users can create orders, view their order history, inspect order details, and only access their own orders."
    },
    @{
        id = "CASE-007"
        name = "Search"
        task = "Build a product catalog with keyword search, filtering, sorting, pagination, empty states, invalid input handling, and automated tests."
    },
    @{
        id = "CASE-008"
        name = "Database"
        task = "Build an application backed by PostgreSQL with normalized relational tables, migrations, foreign keys, indexes, constraints, transaction handling, and automated database tests."
    },
    @{
        id = "CASE-009"
        name = "Security"
        task = "Build a web application that securely handles authentication credentials, API secrets, user authorization, input validation, CSRF protection where applicable, and sensitive error handling."
    },
    @{
        id = "CASE-010"
        name = "Testing"
        task = "Build a production-ready application with unit tests, integration tests, API tests, edge-case coverage, failure handling, and a reproducible test command."
    },
    @{
        id = "CASE-011"
        name = "Ambiguous Requirement"
        task = "Build a marketplace application with secure payments and user accounts. Make reasonable architectural decisions, identify ambiguous requirements, validate important assumptions, and explain what still needs clarification."
    },
    @{
        id = "CASE-012"
        name = "Conflicting Requirements"
        task = "Build an application using PostgreSQL as the primary database while also requiring the application to work completely offline without any database connection. Identify the conflict and explain how implementation should proceed."
    }
)

$results = @()

foreach ($case in $cases) {
    Write-Host ""
    Write-Host "Running $($case.id) - $($case.name)" -ForegroundColor Cyan

    $body = @{
        task = $case.task
        repositoryPath = "C:\Users\01\Desktop\agentic-workflow-hackathon\candidate-fixtures\ecommerce-app"
        mode = "live"
    } | ConvertTo-Json -Compress

    try {
        $start = Get-Date

        $response = Invoke-RestMethod `
            -Uri $apiUrl `
            -Method POST `
            -ContentType "application/json" `
            -Body $body

        $end = Get-Date

        $outputPath = "evaluation\$($case.id)-agent.json"

        $response |
            ConvertTo-Json -Depth 30 |
            Out-File -Encoding utf8 $outputPath

        $results += [PSCustomObject]@{
            Case = $case.id
            Name = $case.name
            Success = $response.success
            Mode = $response.mode
            Requirements = @($response.requirements).Count
            Findings = @($response.findings).Count
            Agents = $response.trace.agentCount
            RuntimeSeconds = [math]::Round(($end - $start).TotalSeconds, 2)
            Output = $outputPath
        }

        Write-Host "Completed: $($case.id)" -ForegroundColor Green
    }
    catch {
        Write-Host "FAILED: $($case.id)" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red

        $results += [PSCustomObject]@{
            Case = $case.id
            Name = $case.name
            Success = $false
            Mode = "error"
            Requirements = 0
            Findings = 0
            Agents = 0
            RuntimeSeconds = 0
            Output = ""
        }
    }
}

Write-Host ""
Write-Host "================ EVALUATION SUMMARY ================" -ForegroundColor Yellow

$results | Format-Table -AutoSize

$results |
    ConvertTo-Json -Depth 10 |
    Out-File -Encoding utf8 "evaluation\agent-summary.json"

Write-Host ""
Write-Host "Saved: evaluation\agent-summary.json" -ForegroundColor Green
