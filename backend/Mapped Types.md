# Mapped Types

- Allows developers to generate different versions of a base type
- **THE TYPES ARE GENERATED IN INPUT TYPES, SO IF THE PARENT CLASS/TYPE IS NOT AN INPUTTYPE WITH THE DECORATOR OF @InputType, THE SECOND ARGUMENT MUST BE ADDED TO CONVERT IT INTO INPUTTYPE**



## 1. PartialType

- Takes base class or base type to create a new class that allows all the fields of the original class/type to be not required



## 2. PickType

- constructs a new class by selecting some of the fields from the original class/type
- used for updating some fields of the original class/type



## 3. OmitType

- Similar to Picktype, it creates a new class excluding some fields that have been selected