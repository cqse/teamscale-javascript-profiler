describe('React Simple App', () => {
	it('Produces Coverage', () => {
		cy.visit('http://localhost:9000/');
		cy.get('button').click();
		cy.get('button').click();
		cy.get('button').click();
		cy.get('button').click();
		cy.get('button').click();
		cy.get('button').click();
	});
});
