describe('Login Flow', () => {
  it('should display the login page and authenticate user', () => {
    cy.visit('/login');
    cy.get('input[formControlName="username"]').type('admin');
    cy.get('input[formControlName="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Assert navigation to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('.dashboard-header').should('contain', 'Tableau de bord');
  });
});
