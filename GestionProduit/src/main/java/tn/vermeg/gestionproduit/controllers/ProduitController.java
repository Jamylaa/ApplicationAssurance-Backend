package tn.vermeg.gestionproduit.controllers;

import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.entities.Produit;
import tn.vermeg.gestionproduit.services.ProduitService;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    private final ProduitService produitService;

    public ProduitController(ProduitService produitService) {this.produitService = produitService;}

    @PostMapping
    public Produit createProduit(@RequestBody Produit produit) {
        return produitService.createProduit(produit);}

    @PutMapping("/{idProduit}")
    public Produit updateProduit(@PathVariable String idProduit, @RequestBody Produit produit) {
        return produitService.updateProduit(idProduit, produit);}

    @DeleteMapping("/{idProduit}")
    public void deleteProduit(@PathVariable String idProduit) {
        produitService.deleteProduit(idProduit);}

    @GetMapping("/{idProduit}")
    public Produit getProduitById(@PathVariable String idProduit) {
        return produitService.getProduitById(idProduit);}

    @GetMapping
    public List<Produit> getAllProduits() {
        return produitService.getAllProduits();}
}