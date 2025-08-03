import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:mangrov/branding.dart';

class MixMatch extends StatefulWidget {
  const MixMatch({super.key});

  @override
  State<MixMatch> createState() => _MixMatchState();
}

class _MixMatchState extends State<MixMatch> {

  Branding br = Branding();
  String uid = FirebaseAuth.instance.currentUser!.uid;

  PageController upController = PageController();
  PageController downController = PageController();

  bool isReversed = false;


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: br.black,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            backgroundColor: br.black,
          )
        ], 
        body: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Column(
            children: [

              ListTile(
                title: Text("Mix N' Match",
                style: GoogleFonts.inter(
                  color: br.white,
                  fontWeight: FontWeight.w400,
                  fontSize: 20
                ),
                ),
                subtitle: Padding(
                  padding: const EdgeInsets.only(top: 5.0),
                  child: Text("Clothing items, furniture pieces & more.",
                  style: GoogleFonts.inter(
                    color: br.white,
                    fontWeight: FontWeight.w400,
                    fontSize: 14
                  ),
                  ),
                ),
              ), 


              StreamBuilder(
                stream: FirebaseFirestore.instance.collection('trades').where('uid', isNotEqualTo: uid).snapshots(),
                builder: (context, asyncSnapshot) {

                  if (asyncSnapshot.hasData) {

                    List<DocumentSnapshot> arrdata = asyncSnapshot.data!.docs;

                    int half = arrdata.length ~/ 2;

                    List firstHalf = arrdata.take(half).toList();
                    List secondHalf = arrdata.skip(half).toList();

                    return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 15),
                    child: ListView(
                      shrinkWrap: true,
                      reverse: isReversed,
                      physics: NeverScrollableScrollPhysics(),
                      children: [
                        // image
                        SizedBox(
                          height: 300,
                          child: Row(
                            children: [
                  
                              SizedBox(
                                height: double.infinity,
                                child: IconButton(
                                  style: ButtonStyle(
                                    backgroundColor: WidgetStatePropertyAll(br.bg),
                                    shape: WidgetStatePropertyAll(RoundedRectangleBorder(
                                      borderRadius: BorderRadiusGeometry.circular(12)
                                    ))
                                  ),
                                  onPressed: () {
                                    upController.previousPage(duration: Duration(milliseconds: 500), curve: Curves.easeInOut);
                                  }, 
                                  icon: Icon(Icons.keyboard_arrow_left, color: br.white, size: 25,)
                                ),
                              ),
                          
                              Expanded(
                                child: SizedBox(
                                  height: 300,
                                  child: PageView.builder(
                                    controller: upController,
                                    itemCount: firstHalf.length,
                                    itemBuilder: ((context, index) {

                                      List image = firstHalf[index]['images'];
                                      return Container(
                                  margin: EdgeInsets.symmetric(horizontal: 5),
                                  height: 300,
                                  decoration: BoxDecoration(
                                    color: br.white,
                                    borderRadius: BorderRadius.circular(12)
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadiusGeometry.circular(12),
                                    child: Image.network(image[0], fit: BoxFit.cover,)),
                                      );
                                    })
                                  ),
                                )
                              ),
                  
                              SizedBox(
                                height: double.infinity,
                                child: IconButton(
                                  style: ButtonStyle(
                                    backgroundColor: WidgetStatePropertyAll(br.bg),
                                    shape: WidgetStatePropertyAll(RoundedRectangleBorder(
                                      borderRadius: BorderRadiusGeometry.circular(12)
                                    ))
                                  ),
                                  onPressed: () {
                                    upController.nextPage(duration: Duration(milliseconds: 500), curve: Curves.easeInOut);
                                  }, 
                                  icon: Icon(Icons.keyboard_arrow_right, color: br.white, size: 25,)
                                ),
                              ),       
                            ],
                          ),
                        ),
                    
                        // switch
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 0.0, vertical: 10),
                          child: SizedBox(
                            width: double.infinity,
                            child: TextButton(
                              style: ButtonStyle(
                                backgroundColor: WidgetStatePropertyAll(br.bg)
                              ),
                              onPressed: () {
                                setState(() {
                                  isReversed = !isReversed;
                                });
                              }, 
                              child: Text('SWITCH',
                              style: GoogleFonts.inter(
                                color: br.white,
                                fontWeight: FontWeight.w800
                              ),
                              )
                            ),
                          ),
                        ),
                    
                        // image
                        SizedBox(
                          height: 300,
                          child: Row(
                            children: [
                  
                              SizedBox(
                                height: double.infinity,
                                child: IconButton(
                                  style: ButtonStyle(
                                    backgroundColor: WidgetStatePropertyAll(br.bg),
                                    shape: WidgetStatePropertyAll(RoundedRectangleBorder(
                                      borderRadius: BorderRadiusGeometry.circular(12)
                                    ))
                                  ),
                                  onPressed: () {
                                    downController.previousPage(duration: Duration(milliseconds: 500), curve: Curves.easeInOut);
                                  }, 
                                  icon: Icon(Icons.keyboard_arrow_left, color: br.white, size: 25,)
                                ),
                              ),
                          
                             Expanded(
                                child: SizedBox(
                                  height: 300,
                                  child: PageView.builder(
                                    controller: downController,
                                    itemCount: secondHalf.length,
                                    itemBuilder: ((context, index) {

                                      List image = secondHalf[index]['images'];
                                      return Container(
                                  margin: EdgeInsets.symmetric(horizontal: 5),
                                  height: 300,
                                  decoration: BoxDecoration(
                                    color: br.white,
                                    borderRadius: BorderRadius.circular(12)
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadiusGeometry.circular(12),
                                    child: Image.network(image[0], fit: BoxFit.cover,)),
                                      );
                                    })
                                  ),
                                )
                              ),
                  
                              SizedBox(
                                height: double.infinity,
                                child: IconButton(
                                  style: ButtonStyle(
                                    backgroundColor: WidgetStatePropertyAll(br.bg),
                                    shape: WidgetStatePropertyAll(RoundedRectangleBorder(
                                      borderRadius: BorderRadiusGeometry.circular(12)
                                    ))
                                  ),
                                  onPressed: () {
                                    downController.nextPage(duration: Duration(milliseconds: 500), curve: Curves.easeInOut);
                                  }, 
                                  icon: Icon(Icons.keyboard_arrow_right, color: br.white, size: 25,)
                                ),
                              ),       
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                  }

                  return Lottie.asset('lib/animations/loader.json', width: 150);
                  
                }
              )
            ],
          ),
        )
      ),
    );
  }
}