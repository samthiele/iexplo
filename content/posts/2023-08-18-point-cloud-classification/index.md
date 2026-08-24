Are you interested in classification methods for point clouds? Do you know the different challenges we face in point cloud classification?

Take a look at Aldino Rizaldy's summary on modern deep learning approaches for point cloud classification.

Modern 3D Point Cloud Classification

Aldino Rizaldy

Point cloud is a data format that is usually utilized to represent 3D objects. Point cloud simply consists of 3D points with XYZ coordinates and its associated features. Recent developments of lidar sensors make it easier for everyone to obtain point clouds. While lidar is the main instrument to directly capture point clouds, photogrammetric techniques allow us to generate point clouds as the derivative products of the images taken by cameras. Structure from Motion (SfM) technique reconstructs the images orientation and creates sparse point clouds, afterwards Multi View Stereo (MVS) generates the dense point clouds. That means we are able to obtain point clouds with any camera device. Hence, everyone has access to point clouds nowadays for various applications such as robotics, autonomous vehicles, agricultures, mining, surveying, etc.

Figure 1: Point cloud and the corresponding semantic labels. (source: NPM3D benchmark https://npm3d.fr/paris-lille-3d)

Point cloud classification is the task of inferring semantic information of point clouds, either for the whole points or for each point (semantic segmentation). It has been researched and attracted attention in the Computer VIsion community in the last few years due to the unique properties of point clouds in contrast to image classification. While image classification has enjoyed Convolutional Neural Networks (CNNs) as the features encoders, point cloud classification still suffers from finding the natural approaches that fit perfectly for this specific data structure.

In contrast to image classification, point cloud classification has different challenges [1]:

Irregularity. Point clouds have different densities in the different areas. Some areas might have denser points while others might have sparse points.

Unstructured. Point cloud data is not in a regular grid format. The distances between points are not fixed in contrast to images where the distances between pixels are always fixed.

Unordered. Point clouds do not have specific order meaning that one can reorder the points without changing the context of the data.

Those challenges introduce some difficulties when applying deep learning, let’s say CNNs, for classification tasks given raw point clouds as the input of the networks. Practically, applying 1-D CNNs directly to point clouds is possible but it would not solve the aforementioned challenges. CNNs need data with a fixed order such as images, otherwise CNNs always give different outputs if the data is reordered. Reordering pixels in image is not possible hence CNNs work perfectly for image data. However, reordering points in the point clouds is a valid operation thus hindering CNNs to work in a point data.

We can see this problem clearly in Figure 2. Suppose we have three sets of points (*ii)*, (*iii)*, and (*iv)*. *(ii)* and *(iii)* are geometrically different, while *(iii)* and *(iv)* are the same but with different point order. If we directly apply convolution operation to those sets of points, it would result in *fiii* ≠ *fiv* while it should be the same. This problem arises due to the different point order. On the other hand, *fii* = *fiii* while it should be not equal due to the difference in geometrical structure. These examples prove that directly applying CNNs is not possible to point cloud data.

Figure 2. Convolution operation in point data.

(source: PointCNN [https://arxiv.org/pdf/1801.07791.pdf](https://arxiv.org/pdf/1801.07791.pdf))

Prior to the era of modern deep learning for point cloud classification, researchers converted point clouds into image or multi-view images in order to feed the data to the CNNs. While these approaches seem very easy to implement, transforming 3D data into 2D images brings a lot of disadvantages. The main drawback is we lose the third dimension which originally is the main advantage of using 3D point clouds. For instance, in the outdoor scene, we may convert 3D point clouds into images by removing the third dimension which is the height information of the scene. By doing so, we are able to feed the data to any CNNs model but we lose the capability to analyze the data in a 3D format.

Those problems were then eliminated with the rise of the modern neural networks that allow the models to process point clouds directly. In general, the modern deep neural networks for point cloud classification can be divided into some categories by its approaches.

● MLP-based network.

The challenges of point cloud classification above hindered any CNN-based models to be employed directly for point cloud data. PointNet [2] solves the problem by introducing a simple yet smart neural network which is invariant to any permutation and geometric transformation. These strategies allowed the PointNet to consume raw point cloud data without any point-to-image transformation and started the new era of deep learning in point cloud classification.

Figure 3. PointNet architecture.

(source: [https://arxiv.org/pdf/1612.00593.pdf](https://arxiv.org/pdf/1612.00593.pdf))

The permutation invariance of PointNet is achieved by applying a symmetric function to destroy the order of the points. Max-pooling was chosen among other symmetric functions such as summation or multiplication. Another key factor in PointNet architecture is the ability of the network to undergo certain geometric transformations. This can be achieved by applying a learnable matrix called T-Net which capables to learning the affine transformation of the given point clouds. The point features are then learned using the shared Multi-Layer Perceptron (MLPs). Since PointNet only relies on MLP layers, the network is considerably small hence made PointNet become popular due to its simplicity yet having the capability to process raw point clouds.

Undoubtedly, PointNet changed the paradigm of the point cloud classification. However PointNet has a drawback by not considering the neighboring points and fails to capture the geometrical aspects of the local structures. Shortly after that, PointNet++ [3] was introduced to improve PointNet by incorporating the local structures into the network. The idea is to gradually subsample the original input points in several layers from which the neighboring points for each subsampled points are grouped together and encoded using the PointNet. This approach successfully captured the local geometric patterns and influenced many recent deep neural networks for point cloud classification.

Figure 4. PointNet++ architecture.

(source: [https://arxiv.org/pdf/1706.02413.pdf](https://arxiv.org/pdf/1706.02413.pdf))

● Graph-based network

Graph has been widely known to model unstructured data. Since point cloud is an unstructured data, many works have been done to develop graph-based neural networks. Dynamic Graph Convolutional Neural Network (DGCNN) [4] is one of the approaches and the most popular graph-based model for point cloud classification. DGCNN leverages the PointNet architecture by developing point encoders on top of the PointNet. Instead of only using MLP, DGCNN builds graphs based on k-Nearest Neighbors for each point and computes the so-called Edge features which are the relationships between each point and the neighboring points. The Edge features successfully model the local geometry structures using the graphs and improve the performance of PointNet. Despite DGCNN has ‘convolutional’ in its name, it has nothing to do with the convolution operation similar in image convolution. Instead it refers to the graph convolution in which the network relies on.

Figure 5. DGCNN architecture.

(source: [https://arxiv.org/pdf/1801.07829.pdf](https://arxiv.org/pdf/1801.07829.pdf))

● Convolutional-based network

The popularity and the success of CNNs in image classification brought many attention to the point cloud community. Although the idea is clear by adopting convolution operation, applying ‘true’ convolutional filters in point cloud data is a non-trivial solution due to the unstructured and unordered data. Hence every approach has to design custom operators in order to successfully perform convolution operations for point clouds.

PointCNN [5] firstly attempted to adopt the idea of CNNs by introducing the so-called X-Conv operator that weights and permutes the input points into a latent and potentially canonical order. Afterwards, typical convolution operators can be used to encode the point features. PointCNN also relies on hierarchical learning similar to CNNs. Hence the architecture for the segmentation task is similar to Unet by stacking encoder and decoder layers in a downsampling and upsampling flow.

Figure 6. PointCNN architecture.

(source: [https://arxiv.org/pdf/1801.07791.pdf](https://arxiv.org/pdf/1801.07791.pdf))

Another popular custom operator attempting to mimic the convolutional operation is called KPConv. This approach introduced the custom convolutional filters called Kernel Point, similar to kernel pixels in image convolution, but operates in the point data. As the name suggests, KPConv is a kernel which convolves through the whole data but consists of points instead of pixels. It relies on the kernel function to map the relationship between the points of the kernel and points of the input data. It also carries learnable weights to learn the point features. Once the convolution operators have been designed, a network architecture can be constructed using them in a similar way to the image classification or segmentation.

Figure 7. (a) KPConv operator and (b) architecture.

(source: [https://arxiv.org/pdf/1904.08889.pdf](https://arxiv.org/pdf/1904.08889.pdf))

● Transformer-based network

Recently Transformer has been adopted in image classification and segmentation tasks. Although originally designed for natural language processing tasks, the adaptation in the image domain proves that the Transformer-based networks perform better than the CNNs if they were properly trained. This brought attention in the point cloud community. The fact that the Transformer works in sequence data makes it easily adopted for point clouds. Unlike CNNs, adopting Transformer for point cloud classification does not need custom operators since point cloud data can be seen as a sequence data hence it can fit to the design of Transformer.

Point Cloud Transformer (PCT) is the pioneering neural network that only uses Transformer alone without other features encoder. The architecture is somewhat similar to PointNet but it replaces the shared-MLP layers with Transformer layers. The Transformer layers transform the input data into three representation matrices Key, Query and Value, and compute the attention features for each point. The k-Nearest Neighbors is also used to capture the local information. The attention features from several Transformer layers are then aggregated to obtain the global features. Despite the simple design, PCT achieves state-of-the-art results in many benchmark datasets.

Figure 8. Point Cloud Transformer architecture.

(source: [https://arxiv.org/pdf/2012.09688.pdf](https://arxiv.org/pdf/2012.09688.pdf))

At the same time, Point Transformer (PT) was released but this neural network has a more complex architecture. The architecture consists of three blocks: PT block, transition-down, and transition-up. During the downsampling flow, PT blocks and transition-down are constructed in each layer to aggregate multi-scale features. On the other hand, PT blocks and transition-up upsample and propagate point features to the original point resolution. PT also relies on vector self-attention, not a widely used scalar self-attention.

Figure 9. Point Transformer architecture.

(source: [https://arxiv.org/pdf/2012.09164.pdf](https://arxiv.org/pdf/2012.09164.pdf))

References:

[1] [https://arxiv.org/pdf/2001.06280.pdf](https://arxiv.org/pdf/2001.06280.pdf)

[2] PointNet. [https://arxiv.org/pdf/1612.00593.pdf](https://arxiv.org/pdf/1612.00593.pdf)

[3] PointNet++. [https://arxiv.org/pdf/1706.02413.pdf](https://arxiv.org/pdf/1706.02413.pdf)

[4] DGCNN. [https://arxiv.org/pdf/1801.07829.pdf](https://arxiv.org/pdf/1801.07829.pdf)

[5] PointCNN. [https://arxiv.org/pdf/1801.07791.pdf](https://arxiv.org/pdf/1801.07791.pdf)

[6] KPConv. [https://arxiv.org/pdf/1904.08889.pdf](https://arxiv.org/pdf/1904.08889.pdf)

[7] Point Cloud Transformer. [https://arxiv.org/pdf/2012.09688.pdf](https://arxiv.org/pdf/2012.09688.pdf)

[8] Point Transformer. [https://arxiv.org/pdf/2012.09164.pdf](https://arxiv.org/pdf/2012.09164.pdf)

![Cover](fig-01.png)

![Figure 1](fig-02.png)

![Figure 2](fig-03.png)

![Figure 3](fig-04.png)

![Figure 4](fig-05.png)

![Figure 5](fig-06.png)

![Figure 6](fig-07.png)

![Figure 7](fig-08.png)

![Figure 8](fig-09.png)

