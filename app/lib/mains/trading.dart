import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mangrov/branding.dart';
import 'package:mangrov/mains/inside.dart';

class Trading extends StatefulWidget {
  const Trading({super.key});

  @override
  State<Trading> createState() => _TradingState();
}

class _TradingState extends State<Trading> {

  Branding br = Branding();
  TextEditingController search = TextEditingController();

  Widget image(String image, String title) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.all(5.0),
        child: GestureDetector(
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => TradingCategory()));
          },
          child: Stack(
            alignment: Alignment.center,
            children: [
          
              
              
              ClipRRect(
                    borderRadius: BorderRadiusGeometry.circular(12),
                    child: Image.asset(image, height: 200, fit: BoxFit.cover, width: double.infinity,),
                
              ),
          
              Container(
                height: 200,
                color: const Color.fromARGB(86, 0, 0, 0),
              ),
          
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 15.0),
                child: Text(title.toUpperCase(),
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  color: br.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 16
                ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        
        ListTile(
          title: Text('Trading',
          style: GoogleFonts.inter(
            color: br.white,
            fontSize: 20
          ),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.symmetric(vertical: 5),
            child: Text('Give your used items in exchange for other ones.',
            style: GoogleFonts.inter(
              color: Colors.white,
            ),
            ),
          ),
        ),


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
                                
                              hintText: 'Search by categories...',
                              hintStyle: GoogleFonts.inter(
                                color: Colors.grey[600],
                                fontSize: 14
                              )
                            ),
                          ),
                        ),




          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10.0),
            child: Column(
              children: [
                Row(
                  children: [
                    image('lib/categories/fashion.jpg', 'fashion'),
                    image('lib/categories/sports.jpg', 'sports & fitness'),
                  ],
                ),
                Row(
                  children: [
                    image('lib/categories/elec.jpg', 'electronics'),
                    image('lib/categories/home.jpg', 'home decor'),
                  ],
                ),
                
                Row(
                  children: [
                    image('lib/categories/beauty.jpg', 'beauty'),
                    image('lib/categories/toys.jpg', 'baby items & toys'),
                  ],
                ),
              ],
            ),
          ) 



      ],
    );
  }
}