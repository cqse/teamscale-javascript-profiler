describe('Tour of Heroes', () => {
	it('Produces Coverage', () => {
		cy.visit('http://localhost:9000/');
		cy.get('#search-box').click();
		cy.get('body').click();
		cy.get('.heroes-menu > a:nth-child(1)').click();
		cy.get('button:nth-child(4)').click();
		cy.get('.clear').click();
		cy.get('nav > a:nth-child(2)').click();
		cy.get('li:nth-child(1) > .delete').click();
		cy.get('li:nth-child(5) > .delete').click();
		cy.get('.clear').click();
		cy.get('#new-hero').click();
		cy.get('#new-hero').type('Test');
		cy.get('.add-button').click();
		cy.get('li:nth-child(9) > a').click();
		cy.get('a:nth-child(1)').click();
		cy.get('.clear').click();
		cy.get('#search-box').click();
		cy.get('#search-box').type('Foo');
		cy.document().trigger('visibilitychange');
	});
});
