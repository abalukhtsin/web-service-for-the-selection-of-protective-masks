package by.anymask.core.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name = "mask")
@NoArgsConstructor
@AllArgsConstructor
public class Mask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String manufacturer;
    private String shop;
    private String type;
    private String protection_class;
    private String material;
    private Long number_layer;
    private String color;
    private Long price;
}
