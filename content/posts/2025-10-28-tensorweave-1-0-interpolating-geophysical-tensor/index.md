Geophysical tensor fields offer powerful insights into subsurface structures, but interpolating sparse or irregularly sampled measurements, such as full-tensor potential field gradiometry, is challenging. With colleagues, we developed Tensorweave 1.0, a physics-informed spatial neural network to address this.

Our method treats tensors as derivatives of an underlying scalar field, enabling consistent, high-fidelity interpolation across the entire domain. By leveraging the differentiable nature of neural networks, Tensorweave 1.0 not only honours the physical constraints of potential fields but also reconstructs the scalar and vector fields that generate the observed tensors.

We demonstrated the approach on synthetic gravity gradiometry data and real full-tensor magnetic data from Geyer, Germany. Results showed significant improvements in interpolation accuracy, structural continuity, and uncertainty quantification compared to conventional methods.

Paper: [https://doi.org/10.5194/gmd-18-7951-2025](https://doi.org/10.5194/gmd-18-7951-2025)
