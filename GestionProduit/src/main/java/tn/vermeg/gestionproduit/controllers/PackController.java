package tn.vermeg.gestionproduit.controllers;
import org.springframework.web.bind.annotation.*;
import tn.vermeg.gestionproduit.entities.Pack;
import tn.vermeg.gestionproduit.services.PackService;
import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/packs")
public class PackController {

    private final PackService packService;

    public PackController(PackService packService) {this.packService = packService;}

    @PostMapping
    public Pack createPack(@RequestBody Pack pack) {
        return packService.createPack(pack);}

    @PutMapping("/{idPack}")
    public Pack updatePack(@PathVariable String idPack, @RequestBody Pack pack) {
        return packService.updatePack(idPack, pack);}

    @DeleteMapping("/{idPack}")
    public void deletePack(@PathVariable String idPack) {packService.deletePack(idPack);}

    @GetMapping("/{idPack}")
    public Pack getPackById(@PathVariable String idPack) {return packService.getPackById(idPack);}

    @GetMapping
    public List<Pack> getAllPacks() {return packService.getAllPacks();}
}