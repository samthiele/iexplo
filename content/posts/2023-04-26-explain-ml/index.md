By Samiran Das: *[https://sites.google.com/view/samiran-das/home?authuser=0](https://sites.google.com/view/samiran-das/home?authuser=0)

Artificial intelligence and machine learning are already influencing our daily lives in many ways. The personalized recommendations we see in online retail platforms, the surveillance tasks carried out at public and private places, and the diagnosis of various diseases from biomedical signals or medical images are mostly powered by advanced machine learning concepts. The enormous applicability of AI/ML has led to two distinct categorizations of the human population. The experts who are developing and implementing these artificial intelligence tools and algorithms and the lay persons who do not necessarily understand the technology they are using. As machine learning applications grow, this aforementioned gap is going to widen as the technology and algorithmic aspects become complicated. As a consequence, the laymen who are using these tools are becoming skeptical about the underlying learning methods. Naturally, general citizens with a relatively lesser understanding of AI/ML will want to understand the decision-making process before deploying it in important tasks. However, the advanced ML models are so complex that even the experts also do not completely comprehend why the model provides some predictions. For instance, even the experts hardly comprehend how different deep neural networks, which are so popular, are looking at while making the prediction. Various recent studies have also highlighted that simpler methods, which are easy to comprehend, do not necessarily lead to accurate results. On the other hand, the complex models which obtain excellent performance are rather extremely difficult to interpret. However, high-stakes decisions such as medical diagnosis, agricultural crop recommendation, government policy-making, financial decision-making, etc. require both high accuracy and interpretability.

For example, recently ML algorithms have provided suggestions to the farmers on which crop to cultivate.

These models essentially capture some sensor data related to soil properties, weather conditions, etc. These algorithms also incorporate suggestions from experts or historical crop yields to provide suggestions. Assume that the farmer followed the crop suggestions that the ML algorithm provided. However, the crop yield was too low, and the farmer incurred a huge loss in the process. Since this prediction outcome has major ramifications on the life of the farmers, mere prediction is not sufficient. The stakeholders, who essentially consider the AIML model as a Blackbox, want to understand the risks associated and learn why the model came up with certain predictions. Like humans, machine learning models can also be biased. Sometimes the data may be insufficient or may be skewed towards a particular class. These aspects prompted various government and policy-making organizations to ensure that certain crucial tasks rely on AI/ML, the algorithms and the prediction process should be adequately explained.

Researchers interested in reducing this trade-off between interpretability of AI/ML, and accuracy came up with the paradigm of explainable AI/ML, or interpretable AI/ML. These approaches either try to understand what the model is doing, or provide post hoc explanations after the deployment of the model, i.e. explain why the model came up with such predictions. The explainable ML methods can come up with local or global explanations, feature importance, visual mapping, etc. Some popular explainable machine learning methods include- SHAP (Shapley Additive exPlanations), DeepSHAP, DeepLIFT (Deep Learning Important FeaTures), CXplain (Causal eXplanaion), and LIME (Local Interpretable Model-agnostic Explanation). Among these models, the model-agnostic explanations can interpret the model outcome without explicitly learning the inner workings of the model. On the contrary, some other explainable machine learning approaches attempt to explain how the algorithm/ model/ network works itself.

If you are further interested in this topic please explore the following resources:

C. Molnar, “Interpretable machine learning”. 2020.

E. Toreini, M. Aitken, K. Coopamootoo, K. Elliott, C. G. Zelaya, and A. Van Moorsel, “The relationship between trust in ai and trustworthy machine learning technologies,” in Proceedings of the 2020 conference on fairness, accountability, and transparency, 2020, pp. 272–283.

A. Adadi and M. Berrada, “Peeking inside the blackbox: a survey on explainable artificial intelligence (xai),” IEEE access, vol. 6, pp. 52 138–52 160, 2018.

F. K. Doˇsilovi´c, M. Brˇci´c, and N. Hlupi´c, “Explainable artificial intelligence: A survey,” in 2018 41st International convention on information and communication technology, electronics and microelectronics (MIPRO). IEEE, 2018, pp. 0210–0215.

M. T. Ribeiro, S. Singh, and C. Guestrin, “why should I trust you?” explaining the predictions of any classifier,” in Proceedings of the 22nd ACM SIGKDD international conference on knowledge discovery and data mining, 2016, pp. 1135–1144.

S. M. Lundberg and S.-I. Lee, “A unified approach to interpreting model predictions,” in Proceedings of the 31st international conference on neural information processing systems, 2017, pp. 4768–4777.

V. Belle and I. Papantonis, “Principles and practice of explainable machine learning,” Frontiers in big Data, p. 39, 2021.

P. Linardatos, V. Papastefanopoulos, and S. Kotsiantis,“Explainable ai: A review of machine learning interpretability methods,” Entropy, vol. 23, no. 1, p. 18, 2020.

J. Wang, X. Jing, Z. Yan, Y. Fu, W. Pedrycz, and L. T. Yang, “A survey on trust evaluation based on machine learning,” ACM Computing Surveys (CSUR), vol. 53, no. 5, pp. 1–36, 2020.

J. Singh and A. Anand, “Exs: Explainable search using local model agnostic interpretability,” in Proceedings of the Twelfth ACM International Conference on Web Search and Data Mining, 2019, pp. 770–773.

K. Natesan Ramamurthy, B. Vinzamuri, Y. Zhang, and A. Dhurandhar, “Model agnostic multilevel explanations,” Advances in neural information processing systems, vol. 33, pp. 5968–5979, 2020.

H. Nori, S. Jenkins, P. Koch, and R. Caruana, “Interpretml: A unified framework for machine learning interpretability,” arXiv preprint arXiv:1909.09223, 2019.

U. Bhatt, A. Xiang, S. Sharma, A. Weller, A. Taly, Y. Jia, J. Ghosh, R. Puri, J. M. Moura, and P. Eckersley, “Explainable machine learning in deployment, in Proceedings of the 2020 Conference on Fairness, Accountability, and Transparency, 2020, pp. 648–657.

Code Implementations:

1. [https://github.com/marcotcr/lime](https://github.com/marcotcr/lime)

2. [https://github.com/thomasp85/lime](https://github.com/thomasp85/lime)

3. [https://github.com/kundajelab/deeplift](https://github.com/kundajelab/deeplift)

4. [https://github.com/d909b/cxplain](https://github.com/d909b/cxplain)

5. [https://github.com/EthicalML/xai](https://github.com/EthicalML/xai)

6. [https://github.com/feifeife/All-about-XAI](https://github.com/feifeife/All-about-XAI)

7. [https://github.com/wangyongjie-ntu/Awesome-explainable-AI](https://github.com/wangyongjie-ntu/Awesome-explainable-AI)

8. [https://github.com/slundberg/shap](https://github.com/slundberg/shap)
