describe('Angular real world App', () => {
    it('Produces Coverage', () => {
        cy.visit('http://localhost:9000/');
        cy.get('body').contains('conduit');
        cy.get('body > app-root > app-home-page > div > div.container.page > div > div.col-md-3 > div > div.tag-list > a:nth-child(1)').click();
        cy.get('body > app-root > app-home-page > div > div.container.page > div > div.col-md-3 > div > div.tag-list > a:nth-child(2)').click();
        cy.get('body > app-root > app-home-page > div > div.container.page > div > div.col-md-3 > div > div.tag-list > a:nth-child(3)').click();
        cy.get('body > app-root > app-home-page > div > div.container.page > div > div.col-md-3 > div > div.tag-list > a:nth-child(4)').click();
        cy.get('body > app-root > app-home-page > div > div.container.page > div > div.col-md-3 > div > div.tag-list > a:nth-child(5)').click();
        cy.get('body > app-root > app-home-page > div > div.container.page > div > div.col-md-9 > div > ul > li:nth-child(2) > a').click();
    });
});