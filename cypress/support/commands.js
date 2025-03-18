// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Command to reset the database to a known state
Cypress.Commands.add('resetDatabase', () => {
  cy.request('POST', 'http://localhost:5050/record/reset-db')
})

// Command to add a test employee
Cypress.Commands.add('addTestEmployee', (employee) => {
  cy.request('POST', 'http://localhost:5050/record', employee)
})

// Command to bulk add test employees
Cypress.Commands.add('addTestEmployees', (employees) => {
  cy.request('POST', 'http://localhost:5050/record/bulk-insert', {
    records: employees
  })
})

// Command to check if an employee exists in the table
Cypress.Commands.add('shouldContainEmployee', (employee) => {
  cy.contains('td', employee.name).should('exist')
  cy.contains('td', employee.position).should('exist')
  cy.contains('td', employee.level).should('exist')
}) 