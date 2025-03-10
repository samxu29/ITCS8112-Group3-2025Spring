describe('Web site availability', () => {

    after(() => {
      cy.contains("Delete").click({ force: true });
      }); 
      it('Sanity listings web site', () => {
        cy.visit('http://localhost:5173');
        cy.contains('Create Record').should('exist');
      });
      it('Test Adding Employee listings', () => {
        cy.visit('http://localhost:5173/create');
        cy.get('#name').type("Employee1");
        cy.get('#position').type("Position1");
        cy.get("#positionIntern").click({ force: true });
        cy.contains("Create person").click({ force: true });
        cy.visit('http://localhost:5173');
        cy.contains('Employee1').should('exist');
      });
     /* it('Test Editing Employee listings', () => {
        //cy.visit('http://localhost:3000');
        cy.contains('Edit').click({ force: true })
        cy.on('url:changed', url => {
                  cy.visit(url);
                  cy.get('#position').clear();
                  cy.get('#position').type("Position2");
                  cy.contains("Update Record").click({ force: true });
                  cy.visit('http://localhost:3000');
                  cy.contains('Position2').should('exist');
              });
       
        
        
      });*/
    });

describe('Bulk Delete Feature', () => {
  beforeEach(() => {
    // Setup test data
    cy.request('POST', 'http://localhost:5050/record/bulk-insert', {
      records: [
        { name: "Test1", position: "Dev1", level: "Junior" },
        { name: "Test2", position: "Dev2", level: "Senior" },
        { name: "Test3", position: "Dev3", level: "Intern" }
      ]
    });
  });

  it('should delete multiple selected records', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[type="checkbox"]').first().click();
    cy.get('input[type="checkbox"]').last().click();
    cy.contains('Delete Selected').click();
    cy.contains('Test1').should('not.exist');
    cy.contains('Test3').should('not.exist');
    cy.contains('Test2').should('exist');
  });

  it('should handle empty selection', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Delete Selected').should('not.exist');
  });
});

describe('Excel Upload Feature', () => {
  it('should successfully upload valid Excel file', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Upload Excel').click();
    cy.fixture('testexcel(1).xlsx').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'testexcel(1).xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
    });
    cy.contains('Successfully inserted').should('exist');
    cy.contains('John Doe').should('exist');
  });

  it('should handle invalid Excel file format', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Upload Excel').click();
    cy.fixture('invalid_format.txt').then(fileContent => {
      cy.get('input[type="file"]').attachFile({
        fileContent,
        fileName: 'invalid_format.txt',
        mimeType: 'text/plain'
      });
    });
    cy.contains('Error processing Excel file').should('exist');
  });
});

describe('Search Feature', () => {
  beforeEach(() => {
    // Setup test data
    cy.request('POST', 'http://localhost:5050/record/bulk-insert', {
      records: [
        { name: "John Developer", position: "Frontend Dev", level: "Senior" },
        { name: "Jane Engineer", position: "Backend Dev", level: "Junior" },
        { name: "Bob Manager", position: "Project Manager", level: "Senior" }
      ]
    });
  });

  it('should search by name', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[placeholder="Search by name or position..."]')
      .type('John');
    cy.contains('John Developer').should('exist');
    cy.contains('Jane Engineer').should('not.exist');
  });

  it('should search by position', () => {
    cy.visit('http://localhost:5173');
    cy.get('input[placeholder="Search by name or position..."]')
      .type('Backend');
    cy.contains('Jane Engineer').should('exist');
    cy.contains('John Developer').should('not.exist');
  });
});

describe('Level Filter Feature', () => {
  beforeEach(() => {
    // Setup test data
    cy.request('POST', 'http://localhost:5050/record/bulk-insert', {
      records: [
        { name: "Dev1", position: "Position1", level: "Senior" },
        { name: "Dev2", position: "Position2", level: "Junior" },
        { name: "Dev3", position: "Position3", level: "Intern" }
      ]
    });
  });

  it('should filter by single level', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Level').click();
    cy.contains('Senior').click();
    cy.contains('Dev1').should('exist');
    cy.contains('Dev2').should('not.exist');
    cy.contains('Dev3').should('not.exist');
  });

  it('should filter by multiple levels', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Level').click();
    cy.contains('Senior').click();
    cy.contains('Junior').click();
    cy.contains('Dev1').should('exist');
    cy.contains('Dev2').should('exist');
    cy.contains('Dev3').should('not.exist');
  });

  it('should clear all filters', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Level').click();
    cy.contains('Senior').click();
    cy.contains('Clear all').click();
    cy.contains('Dev1').should('exist');
    cy.contains('Dev2').should('exist');
    cy.contains('Dev3').should('exist');
  });
});