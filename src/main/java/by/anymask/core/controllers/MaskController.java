package by.anymask.core.controllers;

import by.anymask.core.model.Mask;
import by.anymask.core.repositories.MaskRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class    MaskController {

    public final MaskRepository repository;

    public MaskController(MaskRepository repository) {
        this.repository = repository;
    }

    @CrossOrigin (maxAge = 3600)
    @GetMapping("/catalog")
    public List<Mask> findAll() {
        final List<Mask> all;
        all = repository.findAll();
        return all;
    }
}


