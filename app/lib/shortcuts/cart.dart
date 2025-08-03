import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:mangrov/branding.dart';
import 'package:mangrov/mains/post_info.dart';
import 'package:waterfall_flow/waterfall_flow.dart';

class MyCart extends StatefulWidget {
  const MyCart({super.key});

  @override
  State<MyCart> createState() => _MyCartState();
}

class _MyCartState extends State<MyCart> {

  Branding br = Branding();
  TextEditingController search = TextEditingController();
  
  bool c = true;
  String uid = FirebaseAuth.instance.currentUser!.uid;


  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        backgroundColor: br.black,
        appBar: AppBar(
          backgroundColor: br.black,
          iconTheme: IconThemeData(
            color: Colors.grey[800],
            size: 20
          ),
          centerTitle: false,
          title: Text('My Cart',
          style: GoogleFonts.inter(
            color: br.white,
            fontWeight: FontWeight.w600
          ),
          ),
        ),
      
        body: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Column(
            children: [
      
              Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 10),
                        child: TextField(
                          
                          controller: search,
                          cursorColor: Colors.green,
                          decoration: InputDecoration(
                            filled: true,
                            fillColor: const Color.fromARGB(255, 27, 27, 27),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: const Color.fromARGB(255, 27, 27, 27)
                              ),
                            ),
                              
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(
                                color: Colors.green
                              ),
                            ),
                              
                            prefixIcon: Icon(Icons.search, color: Colors.grey[600],),
                              
                            hintText: 'Search...',
                            hintStyle: GoogleFonts.inter(
                              color: Colors.grey[600],
                              fontSize: 14
                            )
                          ),
                        ),
                      ),
      
            
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10.0),
              child: Row(
                children: [
              
                  Expanded(
                    
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 5.0),
                      child: TextButton(
                        style: ButtonStyle(
                          backgroundColor: WidgetStatePropertyAll(c == true ? Colors.green : const Color.fromARGB(255, 27, 27, 27)),
                          shape: WidgetStatePropertyAll(RoundedRectangleBorder(
                            borderRadius: BorderRadiusGeometry.circular(12)
                          ))
                        ),
                        onPressed: () {
                          setState(() {
                            c = !c;
                          });
                        }, 
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 5.0),
                          child: Text('All Items',
                          style: GoogleFonts.inter(
                            color: br.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w600
                          ),
                          ),
                        )
                      ),
                    ),
                  ),
              
                  Expanded(
                    
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 5.0),
                      child: TextButton(
                        style: ButtonStyle(
                          backgroundColor: WidgetStatePropertyAll(c == false ? Colors.green : const Color.fromARGB(255, 27, 27, 27)),
                          shape: WidgetStatePropertyAll(RoundedRectangleBorder(
                            borderRadius: BorderRadiusGeometry.circular(12)
                          ))
                        ),
                        onPressed: () {
                          setState(() {
                            c = !c;
                          });
                        }, 
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 5.0),
                          child: Text('Collections',
                          style: GoogleFonts.inter(
                            color: br.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w600
                          ),
                          ),
                        )
                      ),
                    ),
                  ),
                ],
              ),
            ),

            c == true ? Padding(
              padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 15),
              child: StreamBuilder(
                stream: FirebaseFirestore.instance.collection('users').doc(uid).collection('cart').snapshots(), 
                builder: ((context, snapshot) {
              
                  if (snapshot.hasData) {
                    List<DocumentSnapshot> arrdata = snapshot.data!.docs;
                    return WaterfallFlow.builder(
                      physics: NeverScrollableScrollPhysics(),
                      itemCount: arrdata.length,
                      shrinkWrap: true,
                      gridDelegate: SliverWaterfallFlowDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 5.0,
                    mainAxisSpacing: 5.0,
                    lastChildLayoutTypeBuilder: (index) => index == arrdata.length
                        ? LastChildLayoutType.foot
                        : LastChildLayoutType.none,
                    ), 
                      itemBuilder: ((context, index) {

                        return StreamBuilder(
                          stream: FirebaseFirestore.instance.collection('posts').doc(arrdata[index].id).snapshots(),
                          builder: (context, asyncSnapshot) {

                            if (asyncSnapshot.hasData) {
                              DocumentSnapshot doc = asyncSnapshot.data!;
                            List images = doc['images'];

                            return GestureDetector(
                              onTap: () {
                                Navigator.push(context, MaterialPageRoute(builder: (context) => PostInfo(
                                  data: doc,
                                )));
                              },
                              child: ClipRRect(
                                borderRadius: BorderRadiusGeometry.circular(12),
                                child: Image.network(images[0], fit: BoxFit.cover,),
                              ),
                            );
                            }

                            return Container();

                            
                          }
                        );
                      })
                    );
                  }
              
              
                  return Lottie.asset('lib/animations/loader.json', width: 150);
                })
              ),
            ) : Container()
            
            ],
          ),
        ),
      ),
    );
  }
}