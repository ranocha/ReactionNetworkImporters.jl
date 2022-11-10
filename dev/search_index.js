var documenterSearchIndex = {"docs":
[{"location":"#ReactionNetworkImporters.jl","page":"Home","title":"ReactionNetworkImporters.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"This package provides importers to load reaction networks into Catalyst.jl ReactionSystems from several file formats. Currently it supports loading networks in the following formats:","category":"page"},{"location":"","page":"Home","title":"Home","text":"A subset of the BioNetGen .net file format.\nNetworks represented by dense or sparse substrate and product stoichiometric matrices.\nNetworks represented by dense or sparse complex stoichiometric and incidence matrices.","category":"page"},{"location":"","page":"Home","title":"Home","text":"SBMLToolkit.jl provides an alternative for loading SBML files into Catalyst models, offering a much broader set of supported features. It allows the import of models that include features such as constant species, boundary condition species, events, constraint equations and more. SBML files can be generated from many standard modeling tools, including BioNetGen, COPASI, and Virtual Cell.","category":"page"},{"location":"","page":"Home","title":"Home","text":"","category":"page"},{"location":"#Examples","page":"Home","title":"Examples","text":"","category":"section"},{"location":"#Loading-a-BioNetGen-.net-file","page":"Home","title":"Loading a BioNetGen .net file","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"A simple network from the builtin BioNetGen bngl examples is the repressilator. The generate_network command in the bngl file outputs a reduced network description, i.e. a .net file, which can be loaded into a Catalyst ReactionSystem as:","category":"page"},{"location":"","page":"Home","title":"Home","text":"using ReactionNetworkImporters\nfname = \"PATH/TO/Repressilator.net\"\nprnbng = loadrxnetwork(BNGNetwork(), fname)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Here BNGNetwork is a type specifying the file format that is being loaded. prnbng is a ParsedReactionNetwork structure with the following fields:","category":"page"},{"location":"","page":"Home","title":"Home","text":"rn, a Catalyst ReactionSystem\nu₀, a Dict mapping initial condition symbolic variables to numeric values and/or symbolic expressions.\np, a Dict mapping parameter symbolic variables to numeric values and/or symbolic expressions.\nvarstonames, a Dict mapping the internal symbolic variable of a species used in the generated ReactionSystem to a String generated from the name in the .net file. This is necessary as BioNetGen can generate exceptionally long species names, involving characters that lead to malformed species names when used with Catalyst.\ngroupstosyms, a Dict mapping the Strings representing names for any groups defined in the BioNetGen file to the corresponding symbolic variable representing the ModelingToolkit symbolic observable associated with the group.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Given prnbng, we can construct and solve the corresponding ODE model for the reaction system by","category":"page"},{"location":"","page":"Home","title":"Home","text":"using OrdinaryDiffEq, Catalyst\nrn = prnbng.rn\ntf = 100000.0\noprob = ODEProblem(rn, Float64[], (0.,tf), Float64[])\nsol = solve(oprob, Tsit5(), saveat=tf/1000.)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Note that we specify empty parameter and initial condition vectors as these are already stored in the generated ReactionSystem, rn. A Dict mapping each symbolic species and parameter to its initial value or symbolic expression can be obtained using ModelingToolkit.defaults(rn).","category":"page"},{"location":"","page":"Home","title":"Home","text":"See the Catalyst documentation for how to generate ODE, SDE, jump and other types of models.","category":"page"},{"location":"#Loading-a-matrix-representation","page":"Home","title":"Loading a matrix representation","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Catalyst ReactionSystems can also be constructed from","category":"page"},{"location":"","page":"Home","title":"Home","text":"substrate and product stoichiometric matrices.\ncomplex stoichiometric and incidence matrices.","category":"page"},{"location":"","page":"Home","title":"Home","text":"For example, here we both directly build a Catalyst network using the @reaction_network macro, and then show how to build the same network from these matrices using ReactionNetworkImporters:","category":"page"},{"location":"","page":"Home","title":"Home","text":"# Catalyst network from the macro:\nrs = @reaction_network begin\n    k1, 2A --> B\n    k2, B --> 2A\n    k3, A + B --> C\n    k4, C --> A + B\n    k5, 3C --> 3A\nend k1 k2 k3 k4 k5\n\n# network from basic stoichiometry using ReactionNetworkImporters\n@parameters k1 k2 k3 k4 k5\n@variables t A(t) B(t) C(t)\nspecies = [A,B,C]\npars = [k1,k2,k3,k4,k5]\nsubstoich =[ 2  0  1  0  0;\n            0  1  1  0  0;\n            0  0  0  1  3]\nprodstoich =  [0  2  0  1  3;\n                1  0  0  1  0;\n                0  0  1  0  0]\nmn= MatrixNetwork(pars, substoich, prodstoich; species=species,\n                  params=pars) # a matrix network\nprn = loadrxnetwork(mn) # dense version\n\n# test the two networks are the same\n@assert rs == prn.rn\n\n# network from reaction complex stoichiometry\nstoichmat =[2  0  1  0  0  3;\n                 0  1  1  0  0  0;\n                 0  0  0  1  3  0]\nincidencemat  = [-1   1   0   0   0;\n                 1  -1   0   0   0;\n                 0   0  -1   1   0;\n                 0   0   1  -1   0;\n                 0   0   0   0  -1;\n                 0   0   0   0   1]\ncmn= ComplexMatrixNetwork(pars, stoichmat, incidencemat; species=species,\n                          params=pars)  # a complex matrix network\nprn = loadrxnetwork(cmn)\n\n# test the two networks are the same\n@assert rs == prn.rn","category":"page"},{"location":"","page":"Home","title":"Home","text":"The basic usages are","category":"page"},{"location":"","page":"Home","title":"Home","text":"mn = MatrixNetwork(rateexprs, substoich, prodstoich; species=Any[],\n                   params=Any[], t=nothing)\nprn = loadrxnetwork(mn::MatrixNetwork)\n\ncmn = ComplexMatrixNetwork(rateexprs, stoichmat, incidencemat; species=Any[],\n                           params=Any[], t=nothing)\nprn = loadrxnetwork(cmn::ComplexMatrixNetwork)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Here MatrixNetwork and ComplexMatrixNetwork are the types, which select that we are constructing a substrate/product stoichiometric matrix-based or a reaction complex matrix-based stoichiometric representation as input. See the Catalyst.jl API for more discussion on these matrix representations, and how Catalyst handles symbolic reaction rate expressions. These two types have the following fields:","category":"page"},{"location":"","page":"Home","title":"Home","text":"rateexprs, any valid Symbolics.jl expression for the rates, or any basic number type. This can be a hardcoded rate constant like 1.0, a parameter like k1 above, or an general Symbolics expression involving parameters and species like k*A.\nmatrix inputs\nFor MatrixNetwork\nsubstoich, a number of species by number of reactions matrix with entry (i,j) giving the stoichiometric coefficient of species i as a substrate in reaction j.\nprodstoich, a number of species by number of reactions matrix with entry (i,j) giving the stoichiometric coefficient of species i as a product in reaction j.\nFor ComplexMatrixNetwork\nstoichmat, the complex stoichiometry matrix defined here.\nincidencemat, the complex incidence matrix defined here.\nspecies, an optional vector of symbolic variables representing each species in the network. Can be constructed using the Symbolics.jl @variables macro. Each species should be dependent on the same time variable (t in the example above).\nparameters, a vector of symbolic variables representing each parameter in the network. Can be constructed with the ModelingToolkit.jl @parameters macro. If no parameters are used it is an optional keyword.\nt, an optional Symbolics.jl variable representing time as the independent variable of the reaction network. If not provided Catalyst.DEFAULT_IV is used to determine the default time variable.","category":"page"},{"location":"","page":"Home","title":"Home","text":"For both input types, loadrxnetwork returns a ParsedReactionNetwork, prn, with only the field, prn.rn, filled in. prn.rn corresponds to the generated Catalyst.jl ReactionSystem that represents the network.","category":"page"},{"location":"","page":"Home","title":"Home","text":"Dispatches are added if substoich and prodstoich both have the type SparseMatrixCSCin case of MatrixNetwork (or stoichmat and incidencemat both have the type SparseMatrixCSC in case of ComplexMatrixNetwork), in which case they are efficiently iterated through using the SparseArrays interface.","category":"page"},{"location":"","page":"Home","title":"Home","text":"If the keyword argument species is not set, the resulting reaction network will simply name the species S1, S2,..., SN for a system with N total species. params defaults to an empty vector, so that it does not need to be set for systems with no parameters.","category":"page"},{"location":"#Reproducibility","page":"Home","title":"Reproducibility","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"<details><summary>The documentation of this SciML package was built using these direct dependencies,</summary>","category":"page"},{"location":"","page":"Home","title":"Home","text":"using Pkg # hide\nPkg.status() # hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"</details>","category":"page"},{"location":"","page":"Home","title":"Home","text":"<details><summary>and using this machine and Julia version.</summary>","category":"page"},{"location":"","page":"Home","title":"Home","text":"using InteractiveUtils # hide\nversioninfo() # hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"</details>","category":"page"},{"location":"","page":"Home","title":"Home","text":"<details><summary>A more complete overview of all dependencies and their versions is also provided.</summary>","category":"page"},{"location":"","page":"Home","title":"Home","text":"using Pkg # hide\nPkg.status(;mode = PKGMODE_MANIFEST) # hide","category":"page"},{"location":"","page":"Home","title":"Home","text":"</details>","category":"page"},{"location":"","page":"Home","title":"Home","text":"You can also download the \n<a href=\"","category":"page"},{"location":"","page":"Home","title":"Home","text":"using TOML\nversion = TOML.parse(read(\"../../Project.toml\",String))[\"version\"]\nname = TOML.parse(read(\"../../Project.toml\",String))[\"name\"]\nlink = \"https://github.com/SciML/\"*name*\".jl/tree/gh-pages/v\"*version*\"/assets/Manifest.toml\"","category":"page"},{"location":"","page":"Home","title":"Home","text":"\">manifest</a> file and the\n<a href=\"","category":"page"},{"location":"","page":"Home","title":"Home","text":"using TOML\nversion = TOML.parse(read(\"../../Project.toml\",String))[\"version\"]\nname = TOML.parse(read(\"../../Project.toml\",String))[\"name\"]\nlink = \"https://github.com/SciML/\"*name*\".jl/tree/gh-pages/v\"*version*\"/assets/Project.toml\"","category":"page"},{"location":"","page":"Home","title":"Home","text":"\">project</a> file.","category":"page"}]
}
