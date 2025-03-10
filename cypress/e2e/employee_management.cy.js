describe('Employee Management System', () => {
  beforeEach(() => {
    // Visit the application before each test
    cy.visit('http://localhost:5173')
  })

  it('should display the employee records table', () => {
    cy.contains('h3', 'Employee Records')
    cy.get('table').should('exist')
    cy.get('th').contains('Name')
    cy.get('th').contains('Position')
    cy.get('th').contains('Level')
  })

  it('should be able to search employees', () => {
    // Test search functionality
    cy.get('input[placeholder="Search by name or position..."]')
      .type('developer')
    
    // Wait for the filtering to take effect
    cy.wait(500)

    // Check if the table updates with filtered results
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).should('contain', 'developer')
    })
  })

  it('should filter by level', () => {
    // Click the level filter button
    cy.contains('button', 'Level').click()
    
    // Select a level (e.g., "Senior")
    cy.contains('label', 'Senior').click()
    
    // Check if the table updates with filtered results
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).should('contain', 'Senior')
    })
  })

  it('should handle bulk selection and deletion', () => {
    // Select all records
    cy.get('thead input[type="checkbox"]').click()
    
    // Verify "Delete Selected" button appears
    cy.contains('button', 'Delete Selected').should('exist')
    
    // Deselect all
    cy.get('thead input[type="checkbox"]').click()
    
    // Verify "Delete Selected" button disappears
    cy.contains('button', 'Delete Selected').should('not.exist')
  })

  it('should open Excel upload modal', () => {
    // Click upload button
    cy.contains('button', 'Upload Excel').click()
    
    // Verify modal appears
    cy.contains('h2', 'Upload Excel File').should('be.visible')
    
    // Close modal
    cy.get('button').contains('×').click()
    
    // Verify modal is closed
    cy.contains('h2', 'Upload Excel File').should('not.exist')
  })

  it('should handle Excel file upload', () => {
    // Create a sample Excel file
    const fileName = 'test_employees.xlsx'
    const fileContent = [
      ['name', 'position', 'level'],
      ['John Doe', 'Software Developer', 'Senior'],
      ['Jane Smith', 'QA Engineer', 'Junior']
    ]

    // Click upload button
    cy.contains('button', 'Upload Excel').click()

    // Upload file
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from(fileContent.join('\\n')),
      fileName: fileName,
      lastModified: Date.now(),
    }, { force: true })

    // Verify preview appears
    cy.contains('Preview (First 10 rows)').should('be.visible')
    
    // Close modal without confirming
    cy.get('button').contains('Cancel').click()
  })
}) 