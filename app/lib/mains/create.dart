import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lottie/lottie.dart';
import 'package:mangrov/branding.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';

class CreatePost extends StatefulWidget {
  const CreatePost({super.key});

  @override
  State<CreatePost> createState() => _CreatePostState();
}

class _CreatePostState extends State<CreatePost> {

  Branding br = Branding();
  PageController controller = PageController();

  // pick category & sub category
  // upload images + descriptions
  // settings (allow likes + comments + save to collection)

  List<File> images = [];
    final ImagePicker picker = ImagePicker();

    Future<void> pickImages() async {
    final List<XFile> pickedFiles = await picker.pickMultiImage();
      setState(() {
        images = pickedFiles.map((file) => File(file.path)).toList();
      });
    
  }

  List categories = [
    [
      'Fashion', 
      [
        'Jeans',
        'Shirts',
        'Tops',
        'Sweaters',
        'Jackets',
        'Skirts',
        'Dresses',
        'Footwear'
      ]
    ],
    [
      'Sports & Fitness',
      [
        'Activewear',
        'Footwear',
        'Equipment',
        'Camping Gear',
        'Jerseys',
        'Outdoor Games'
      ]
    ],
    [
      'Electronics',
      [
        'Keyboards',
        'Headphones',
        ''
      ]
    ],
    [
      'Home Decor',
      []
    ],
    [
      'Beauty',
      []
    ],
    [
      'Baby Items & Toys',
      []
    ]
  ];

  int currentIndex = 0;

  List<String> selected = [];
  TextEditingController title = TextEditingController();
  TextEditingController description = TextEditingController();

  int pageIndex = 0;

  bool isAvailable = true;
  int quantity = 1;

  String uid = FirebaseAuth.instance.currentUser!.uid;
  List<TextEditingController> keywords = [];

  PageController imageController = PageController();
  


  @override
  Widget build(BuildContext context) {

    List cat = categories[currentIndex][1];


    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        bottomNavigationBar: BottomAppBar(
          color: br.black,
          child: Row(
            children: [
      
              pageIndex == 0 ? Container() : IconButton(
                onPressed: () async {
                  await controller.previousPage(duration: Duration(milliseconds: 500), curve: Curves.easeInOut);
                  setState(() {
                    pageIndex = controller.page!.toInt();
                  });
                  
                }, 
                icon: Icon(Icons.arrow_back, color: br.white,)
              ),
              Expanded(child: Container()),
              pageIndex == 1 ? IconButton(
                style: ButtonStyle(
                  backgroundColor: WidgetStatePropertyAll(Colors.green),
                  shape: WidgetStatePropertyAll(RoundedRectangleBorder(
                    borderRadius: BorderRadiusGeometry.circular(12)
                  ))
                ),
                onPressed: () async {
                  
                  showDialog(
                    context: context, 
                    builder: ((context) {
                      return Lottie.asset('lib/animations/loader.json', width: 200);
                    })
                  );

                
                

                

                if (images.isNotEmpty && title.text.isNotEmpty) {
                  try {
                    final storageRef = FirebaseStorage.instance.ref();
                    final List<String> imageUrls = [];
                    

                    List<String> keywordText = [];

                    while (keywordText.length < keywords.length) {
                      for (int i = 0; i < keywords.length; i++) {
                      keywordText.add(keywords[i].text);
                    } 
                    break;
                    } 

                    

                    for (File image in images) {
                      try {
                        // Create a unique file name
                        final fileName = "${DateTime.now().millisecondsSinceEpoch.toString()} + .jpg";
                        final ref = storageRef.child('trade-images/$uid/$fileName');

                        // Upload file
                        final uploadTask = ref.putFile(image);
                        await uploadTask.whenComplete(() async {
                          // Get the download URL
                          final downloadUrl = await ref.getDownloadURL();
                          imageUrls.add(downloadUrl);
                        });

                      } catch (e) {
                        print('Error uploading image: $e');
                      }
                    }



                    final firestore = FirebaseFirestore.instance;

                    await firestore.collection('trades').add({
                      'uid':uid,
                      'timestamp':DateTime.now(),
                      'title':title.text,
                      'description':description.text,
                      'images':imageUrls,
                      'keywords':keywordText,   
                      'niche':categories[currentIndex][0],
                      'quantity':quantity
                                
                    });

                    Navigator.pop(context);
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Success! New trade created.')));

                  } catch (e) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Something went wrong. Please try again.')));
                  }
                } else {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('One or more details are missing.')));
                }
                }, 
                icon: Icon(Icons.check, color: br.white,)
              ) : IconButton(
                onPressed: () async {
      
                  if (selected.isNotEmpty) {
                    await controller.nextPage(duration: Duration(milliseconds: 500), curve: Curves.easeInOut);
                    setState(() {
                    pageIndex = controller.page!.toInt();
                  });
                  
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Please pick at least one sub-category.')));
                  }
                  
                }, 
                icon: Icon(Icons.arrow_forward, color: br.white,)
              ),
            ],
          ),
        ),
        backgroundColor: br.black,
        body: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) => [
            SliverAppBar(
              backgroundColor: br.black,
      
            )
          ],
          body: PageView(
            controller: controller,
            children: [ 
              
              SingleChildScrollView(
                scrollDirection: Axis.vertical,
                child: Column(
                  children: [
                
                    ListTile(
                      title: Text('Create post to showcase \nwhat you are offering.',
                      style: GoogleFonts.inter(
                        color: br.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600
                      ),
                      ),
                
                      subtitle: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10.0),
                        child: Text('But first, choose your categories for users \nto find your item.',
                        style: GoogleFonts.inter(
                          color: br.white,
                          fontSize: 14
                        ),
                        ),
                      ),
                    ),
                
                
                    Padding(
                      padding: const EdgeInsets.only(left: 10.0),
                      child: SizedBox(
                        height: 60,
                        child: ListView.builder(
                         
                          shrinkWrap: true,
                          scrollDirection: Axis.horizontal,
                          itemCount: categories.length,
                          itemBuilder: ((context, index) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 5.0, vertical: 5),
                              child: TextButton(
                                style: ButtonStyle(
                                  backgroundColor: WidgetStatePropertyAll(currentIndex == index ? Colors.green : const Color.fromARGB(255, 27, 27, 27)),
                                  shape: WidgetStatePropertyAll(RoundedRectangleBorder(
                                    borderRadius: BorderRadiusGeometry.circular(12)
                                  ))
                                ),
                                onPressed: () {
                                  setState(() {
                                    currentIndex = index;
                                  });
                                }, 
                                child: Text(categories[index][0],
                                style: GoogleFonts.inter(
                                  color: br.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600
                                ),
                                )
                              ),
                            );
                          })
                        ),
                      ),
                    ),
                
                
                    ListView.builder(
                      itemCount: cat.length,
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      itemBuilder: ((context, index) {
                        return ListTile(
                          trailing: IconButton(
                            onPressed: () {
                              if (selected.contains(cat[index])) {
                                setState(() {
                                  selected.remove(cat[index]);
                                });
                                
                              } else {
                                setState(() {
                                  selected.add(cat[index]);
                                });
                                
                              }
                            }, 
                            icon: Icon(selected.contains(cat[index]) ? Icons.check : Icons.add, color: selected.contains(cat[index]) ? Colors.green : br.white, size: 20,)
                          ),
                          title: Text(cat[index],
                          style: GoogleFonts.inter(
                            color: br.white
                          ),
                          ),
                        );
                      })
                    )
                
                  ],
                ),
              ),
      
      
              SingleChildScrollView(
                scrollDirection: Axis.vertical,
                child: Column(
                  children: [
      
                    ListTile(
                      title: Text('iTEM iNFORMATION',
                      style: GoogleFonts.inter(
                        color: br.white,
                        fontWeight: FontWeight.w800
                      ),
                      ),
                    ),
      
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 15.0),
                      child: SizedBox(
                        width: double.infinity,
                        child: TextButton.icon(
                          style: ButtonStyle(
                            backgroundColor: WidgetStatePropertyAll(Colors.green),
                            
                          ),
                          onPressed: pickImages, 
                          icon: Icon(Icons.upload, color: br.white, size: 20,),
                          label: Text('UPLOAD IMAGES',
                          style: GoogleFonts.inter(
                            color: br.white,
                            fontWeight: FontWeight.w800
                          ),
                          )
                        ),
                      ),
                    ), 

                    images.isNotEmpty ? 
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 15.0),
                  child: Column(
                    children: [
                      SizedBox(
                        height: 400,
                        width: double.infinity,
                        child: PageView.builder(
                          itemCount: images.length,
                          controller: imageController,
                          itemBuilder: ((context, index) {
                            return ClipRRect(
                              borderRadius: BorderRadiusGeometry.circular(12),
                              child: Image.file(File(images[index].path)),
                            );
                          })
                        ),
                      ),
                  
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 15.0),
                        child: SmoothPageIndicator(
                          controller: imageController, 
                          count: images.length,
                          effect: ExpandingDotsEffect(
                            dotColor: Colors.grey[700]!,
                            activeDotColor: Colors.green,
                            dotHeight: 7,
                            dotWidth: 7
                          ),
                        ),
                      )
                  
                      
                    ],
                  ),
                ) : Container(),


      
                    SizedBox(
                      height: 20,
                    ),
      
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 5),
                      child: TextField(
                        
                        keyboardType: TextInputType.multiline,                      
                        cursorColor: Colors.green,
                        controller: title,                  
                        style: GoogleFonts.inter(
                          color: br.white,
                          fontSize: 16, 
                        ),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: 'Title...',
                          hintStyle: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.grey[700],
                            
                          )
                        ),
                      ),
                    ),

                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 5),
                      child: TextField(
                        
                        keyboardType: TextInputType.multiline,                      
                        cursorColor: Colors.green,
                        controller: description,                  
                        style: GoogleFonts.inter(
                          color: br.white,
                          fontSize: 15, 
                        ),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: 'Description...',
                          hintStyle: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.grey[700],
                            
                          )
                        ),
                      ),
                    ),

                    ListTile(                   
                      trailing: Switch(
                        activeColor: Colors.green,
                        value: isAvailable, 
                        onChanged: ((val) {
                          setState(() {
                            isAvailable = !isAvailable;
                          });
                        })
                      ),
                      title: Text('Item is available',
                      style: GoogleFonts.inter(
                        color: br.white,
                        fontSize: 14
                      ),
                      ),
                    ),

                    ListTile(
                      title: Text('QUANTITY',
                    style: GoogleFonts.inter(
                      color: br.white,
                      fontWeight: FontWeight.w800
                    ),
                    ),

                    subtitle: Row(
                      children: [

                        IconButton(
                          onPressed: () {
                            if (quantity == 1) {
                              print("smallest quantity possible");
                            } else {
                              setState(() {
                                quantity--;
                              });
                            }
                          }, 
                          icon: Icon(Icons.remove, color: br.white, size: 20,)
                        ),

                        Expanded(
                          child: Text(quantity.toString(),
                          textAlign: TextAlign.center,
                          style: GoogleFonts.inter(
                            color: br.white,
                            fontWeight: FontWeight.w600
                          ),
                          )
                        ),

                        IconButton(
                          onPressed: () {
                            setState(() {
                              quantity++;
                            });
                          }, 
                          icon: Icon(Icons.add, color: br.white, size: 20,)
                        ),


                      ],
                    ),
                    ),

                    Padding(
                    padding: const EdgeInsets.only(top: 10.0),
                    child: ListTile(
                    subtitle: Text('They help show your trade in searches.',
                    style: GoogleFonts.inter(
                      color: br.white,
                      fontWeight: FontWeight.w500
                    ),
                    ),
                    title: Text('KEYWORDS',
                    style: GoogleFonts.inter(
                      color: br.white,
                      fontWeight: FontWeight.w800
                    ),
                    ),
                                    ),
                  ),

                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 10.0),
                    child: TextButton.icon(
                      style: ButtonStyle(
                        backgroundColor: WidgetStatePropertyAll(const Color.fromARGB(255, 47, 47, 47))
                      ),
                      onPressed: () {
                        setState(() {
                          keywords.add(TextEditingController());
                        });
                      }, 
                      icon: Icon(Icons.search, color: br.white, size: 20,),
                      label: Text('ADD KEYWORD',
                      style: GoogleFonts.inter(
                        color: br.white,
                        fontWeight: FontWeight.w700
                      ),
                      )
                    ),
                  ),

                  ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: keywords.length,
                    itemBuilder: ((context, index) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 5),
                        child: TextField(
                          
                          cursorColor: Colors.green,
                          style: GoogleFonts.inter(
                            color: br.white,
                            fontSize: 14
                          ),
                          autofocus: true,
                          decoration: InputDecoration(
                            suffixIcon: IconButton(
                              onPressed: () {
                                setState(() {
                                  keywords.remove(keywords[index]);
                                });
                              }, 
                              icon: Icon(Icons.remove_circle)
                            ),
                            border: InputBorder.none,
                            hintText: 'Type here...',
                            hintStyle: GoogleFonts.inter(
                              color: Colors.grey,
                              fontSize: 13
                            )
                          ),
                          controller: keywords[index],
                        ),
                      );
                    })
                  ),
      
      
                  ],
                ),
              )
            ]
          ),
        ),
      ),
    );
  }
}