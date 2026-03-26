package tn.vermeg.gestionproduit.controllers;

import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.entities.Garantie;
import tn.vermeg.gestionproduit.entities.TypeGarantie;
import tn.vermeg.gestionproduit.services.GarantieService;
import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/garanties")
public class GarantieController {

    private final GarantieService garantieService;

    public GarantieController(GarantieService garantieService) {
        this.garantieService = garantieService;}

    @PostMapping
    public Garantie createGarantie(@RequestBody Garantie garantie) {
        return garantieService.createGarantie(garantie);}

    @PutMapping("/{idGarantie}")
    public Garantie updateGarantie(@PathVariable String idGarantie, @RequestBody Garantie garantie) {
        return garantieService.updateGarantie(idGarantie, garantie);}

    @DeleteMapping("/{idGarantie}")
    public void deleteGarantie(@PathVariable String idGarantie) {
        garantieService.deleteGarantie(idGarantie);}

    @GetMapping("/{idGarantie}")
    public Garantie getGarantieById(@PathVariable String idGarantie) {
        return garantieService.getGarantieById(idGarantie);}

    @GetMapping
    public List<Garantie> getAllGaranties() {
        return garantieService.getAllGaranties();}

    @GetMapping("/type/{typeGarantie}")
    public List<Garantie> getGarantiesByType(@PathVariable TypeGarantie typeGarantie) {
        return garantieService.getGarantiesByType(typeGarantie);}

    @GetMapping("/actives")
    public List<Garantie> getGarantiesActives() {
        return garantieService.getGarantiesActives();}
}