import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_card_swiper/flutter_card_swiper.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';
import 'package:mangrov/branding.dart';
import 'package:mangrov/mains/create.dart';
import 'package:waterfall_flow/waterfall_flow.dart';

class TradingCategory extends StatefulWidget {
  const TradingCategory({super.key});

  @override
  State<TradingCategory> createState() => _TradingCategoryState();
}

class _TradingCategoryState extends State<TradingCategory> {

  Branding br = Branding();
  TextEditingController search = TextEditingController();

  int currentIndex = 0;
  String uid = FirebaseAuth.instance.currentUser!.uid;

  bool cardMode = false;

  List<String> categories = [
    'All',
    'Jeans',
    'Shirts',
    'Tops',
    'Sweaters',
    'Jackets',
    'Skirts',
    'Dresses',
    'Footwear',
  ];


  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        floatingActionButton: IconButton(
          onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => CreatePost()));
          }, 
          icon: Icon(Icons.add, color: br.white, size: 22,)
        ),
        backgroundColor: br.black,
        body: NestedScrollView(
          headerSliverBuilder: cardMode == false ? (context, innerBoxIsScrolled) => [
            SliverAppBar(
              backgroundColor: br.black,
              iconTheme: IconThemeData(
                color: Colors.grey[700],
                size: 20
              ),
            ) 
          ] : (context, innerBoxIsScrolled) => [], 
          body: SingleChildScrollView(
            scrollDirection: Axis.vertical,
            child: Column(
              children: [

                cardMode == true ? ListTile() : Container(),
      
                ListTile(
                  title: Text('fashion'.toUpperCase(),
                  style: GoogleFonts.inter(
                    color: br.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 20
                  ),
                  ),
                ),
      
      
                Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 15.0, vertical: 0),
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
                                  
                                hintText: 'Search by categories...',
                                hintStyle: GoogleFonts.inter(
                                  color: Colors.grey[600],
                                  fontSize: 14
                                )
                              ),
                            ),
                          ),
               

              Padding(
                padding: const EdgeInsets.only(left: 10.0),
                child: SizedBox(
                  height: 60,
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: categories.length,
                    scrollDirection: Axis.horizontal,
                    itemBuilder: ((context, index) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 5.0, vertical: 10),
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
                          child: Text(categories[index],
                          style: GoogleFonts.inter(
                            color: br.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 13
                          ),
                          )
                        ),
                      );
                    })
                  ),
                ),
              ),
      
              
              Row(
                children: [

                  Expanded(child: Container()),
                  TextButton.icon(
                    icon: Switch(
                      
                      activeColor: Colors.green,
                      value: cardMode, 
                      onChanged: (val) {
                        setState(() {
                          cardMode = !cardMode;
                        });
                      }
                    ),
                    onPressed: () {}, 
                    label: Text('Card Mode',
                    style: GoogleFonts.inter(
                      color: br.white,
                    ),
                    )
                  )
                ],
              ), 

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 15.0),
                child: StreamBuilder(
                  stream: FirebaseFirestore.instance.collection('trades').where('uid', isNotEqualTo: uid).snapshots(), 
                  builder: ((context, snapshot) {
                
                    if (snapshot.hasData) {
                
                      List<DocumentSnapshot> arrdata = snapshot.data!.docs;
                
                      return cardMode == true ? SizedBox(
                        height: 400,
                        child: CardSwiper(
                          
                          cardBuilder: ((context, x, z, y) {

                             List images = arrdata[x]['images'];


                             return ClipRRect(
                              borderRadius: BorderRadiusGeometry.circular(12),
                              child: Image.network(images[0], fit: BoxFit.cover,),
                             );       
                          }), 
                          cardsCount: arrdata.length
                        ),
                      ) 
                      
                      : 
                      
                      WaterfallFlow.builder(
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
                
                          List images = arrdata[index]['images'];
                
                          return GestureDetector(
                            onTap: () {
                             
                            },
                            child: ClipRRect(
                              borderRadius: BorderRadiusGeometry.circular(12),
                              child: Image.network(images[0], fit: BoxFit.cover,),
                            ),
                          );
                        })
                      );
                    }
                
                    return Lottie.asset('lib/animations/loader.json', width: 150);
                  })
                ),
              )
              
              ],
            ),
          )
        ),
      ),
    );
  }
}